<?php

namespace App\Http\Controllers;

use App\Models\PermintaanData;
use App\Models\Temuan;
use App\Models\SuratTugasPemeriksaan;
use App\Models\ResponTemuan;
use App\Models\TindakLanjut;
use App\Models\Verifikasi;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class PdfController extends Controller
{
    public function generatePermintaanData($id, Request $request)
    {
        
        $permintaan = PermintaanData::with([
            'auditor',
            'auditee',
            'surat',
            'jadwal_audits',
            'temuans.auditee',
            'temuans.auditor',
            'temuans.responTemuans.tindakLanjuts.verifikasis',
        ])->findOrFail($id);

       
        $temuans = $permintaan->temuans ?? collect();

        
        $verifikasis = $temuans->flatMap(function ($temuan) {
            return $temuan->responTemuans->flatMap(function ($respon) {
                return $respon->tindakLanjuts->flatMap(function ($tindak) {
                    return $tindak->verifikasis ?? collect();
                });
            });
        })->flatten(1)->values();

        $jadwalIds = $request->query('jadwal_ids');
        
        if ($jadwalIds) {
            
            $jadwalIdsArray = is_array($jadwalIds) ? $jadwalIds : explode(',', $jadwalIds);
            $jadwalIdsArray = array_map('intval', array_filter($jadwalIdsArray));
            
           
            $selectedJadwals = $permintaan->jadwal_audits->filter(function($jadwal) use ($jadwalIdsArray) {
                return in_array($jadwal->id_jadwal, $jadwalIdsArray);
            })->values();
            
          
            $selectedDates = $selectedJadwals->map(function($jadwal) {
                return $jadwal->tanggal_audit->format('Y-m-d');
            })->toArray();
            
          
            $filteredTemuans = Temuan::where('id_permintaan', $id)
                ->whereIn(\DB::raw("DATE(tanggal_temuan)"), $selectedDates)
                ->with([
                    'auditee',
                    'auditor',
                    'responTemuans.tindakLanjuts.verifikasis'
                ])
                ->get()
                ->values();
            
            $permintaan->jadwal_audits = $selectedJadwals;
            $permintaan->temuans = $filteredTemuans;
        }

        $pdf = Pdf::loadView('pdf.permintaan', compact('permintaan', 'verifikasis'));
        
        return $pdf->stream('permintaan-' . $id . '.pdf');
    }

    public function generateSuratTugas($id)
    {
        $suratTugas = SuratTugasPemeriksaan::findOrFail($id);
        $pdf = Pdf::loadView('pdf.surat_tugas', compact('suratTugas'));
        $filename = sprintf('SuratTugas_%03d_%s.pdf', $suratTugas->id_surat, date('Y'));
        return $pdf->stream($filename);
    }

    public function previewPermintaanDataAuditor($id, Request $request)
    {
        $permintaan = PermintaanData::with(['auditor', 'auditee', 'jadwal_audits'])
            ->findOrFail($id);

        $jadwalIds = $request->query('jadwal_ids');
        
        if ($jadwalIds) {
            $jadwalIdsArray = is_array($jadwalIds) ? $jadwalIds : explode(',', trim($jadwalIds));
            $jadwalIdsArray = array_map('intval', array_filter($jadwalIdsArray));
            
            $selectedJadwals = $permintaan->jadwal_audits->filter(function($jadwal) use ($jadwalIdsArray) {
                return in_array($jadwal->id_jadwal, $jadwalIdsArray);
            })->values();
            
            $selectedDates = $selectedJadwals->pluck('tanggal_audit')->map(function($date) {
                return $date->format('Y-m-d');
            })->toArray();
            
            // Query temuans dari database dengan tanggal yang cocok
            $filteredTemuans = Temuan::where('id_permintaan', $id)
                ->whereIn(\DB::raw("DATE(tanggal_temuan)"), $selectedDates)
                ->get()
                ->values();
            
            $permintaan->jadwal_audits = $selectedJadwals;
            $permintaan->temuans = $filteredTemuans;
        }

        $pdf = Pdf::loadView('pdf.permintaan', compact('permintaan'));
        return $pdf->stream('permintaan-' . $id . '.pdf');
    }

    public function previewPermintaanDataAuditee($id, Request $request)
    {
        $user = auth()->user();
        $permintaan = PermintaanData::with(['auditor', 'auditee', 'jadwal_audits', 'temuans', 'temuans.responTemuans.tindakLanjuts'])
            ->where('id_permintaan', $id)
            ->where('level_role', $user->level_role)
            ->where('cek_verif', 1)
            ->firstOrFail();

        $jadwalIds = $request->query('jadwal_ids');
        $auditeeList = $request->query('auditee_list') ? explode('|', $request->query('auditee_list')) : [];
        
        if ($jadwalIds) {
            $jadwalIdsArray = is_array($jadwalIds) ? $jadwalIds : explode(',', $jadwalIds);
            $jadwalIdsArray = array_map('intval', array_filter($jadwalIdsArray));
            
            $selectedJadwals = $permintaan->jadwal_audits->filter(function($jadwal) use ($jadwalIdsArray) {
                return in_array($jadwal->id_jadwal, $jadwalIdsArray);
            })->values();
            
            $selectedDates = $selectedJadwals->pluck('tanggal_audit')->map(function($date) {
                return $date->format('Y-m-d');
            })->toArray();
            
            // Query temuans dari database dengan tanggal yang cocok
            $filteredTemuans = Temuan::where('id_permintaan', $id)
                ->whereIn(\DB::raw("DATE(tanggal_temuan)"), $selectedDates)
                ->with([
                    'responTemuans.tindakLanjuts'
                ])
                ->get()
                ->values();
            
            $permintaan->jadwal_audits = $selectedJadwals;
            $permintaan->temuans = $filteredTemuans;
        }

        $pdf = Pdf::loadView('pdf.permintaan', compact('permintaan', 'auditeeList'));
        return $pdf->stream('permintaan-' . $id . '.pdf');
    }

    public function generatePermintaanDataAuditee($id, Request $request)
    {
        $user = auth()->user();
        $permintaan = PermintaanData::with([
            'auditor',
            'auditee',
            'jadwal_audits',
            'temuans.auditee',
            'temuans.auditor',
            'temuans.responTemuans.tindakLanjuts.verifikasis',
        ])
        ->where('id_permintaan', $id)
        ->where('level_role', $user->level_role)
        ->where('cek_verif', 1)
        ->firstOrFail();

        $auditeeList = $request->query('auditee_list') ? explode('|', $request->query('auditee_list')) : [];
        $jadwalIds = $request->query('jadwal_ids');

        if ($jadwalIds) {
            $jadwalIdsArray = is_array($jadwalIds) ? $jadwalIds : explode(',', trim($jadwalIds));
            $jadwalIdsArray = array_map('intval', array_filter($jadwalIdsArray));
            
            $selectedJadwals = $permintaan->jadwal_audits->filter(function($jadwal) use ($jadwalIdsArray) {
                return in_array($jadwal->id_jadwal, $jadwalIdsArray);
            })->values();
            
            $selectedDates = $selectedJadwals->pluck('tanggal_audit')->map(function($date) {
                return $date->format('Y-m-d');
            })->toArray();
            
            $filteredTemuans = Temuan::where('id_permintaan', $id)
                ->whereIn(\DB::raw("DATE(tanggal_temuan)"), $selectedDates)
                ->with([
                    'auditee',
                    'auditor',
                    'responTemuans.tindakLanjuts.verifikasi'
                ])
                ->get()
                ->values();
            
            $permintaan->jadwal_audits = $selectedJadwals;
            $permintaan->temuans = $filteredTemuans;
        }

        $temuans = $permintaan->temuans ?? collect();

        $verifikasis = $temuans->flatMap(function ($temuan) {
            return $temuan->responTemuans->flatMap(function ($respon) {
                return $respon->tindakLanjuts->flatMap(function ($tindak) {
                    return $tindak->verifikasis ?? collect();
                });
            });
        })->flatten(1)->values();
        
        $pdf = Pdf::loadView('pdf.permintaan', compact('permintaan', 'verifikasis', 'auditeeList'));
        return $pdf->stream('permintaan-' . $id . '.pdf');
    }

}