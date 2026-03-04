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
            
          
            $temuanBerjadwal = Temuan::where('id_permintaan', $id)
                ->whereIn('tanggal_temuan', $selectedDates)
                ->get();
            
            $permintaan->jadwal_audits = $selectedJadwals;
            $permintaan->temuan = $temuanBerjadwal;
        } else {
            $temuan = Temuan::where('id_permintaan', $id)->get();
            $permintaan->temuan = $temuan;
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
            $jadwalIdsArray = is_array($jadwalIds) ? $jadwalIds : explode(',', $jadwalIds);
            $jadwalIdsArray = array_map('intval', array_filter($jadwalIdsArray));
            
            $selectedJadwals = $permintaan->jadwal_audits->filter(function($jadwal) use ($jadwalIdsArray) {
                return in_array($jadwal->id_jadwal, $jadwalIdsArray);
            })->values();
            
            $selectedDates = $selectedJadwals->map(function($jadwal) {
                return $jadwal->tanggal_audit->format('Y-m-d');
            })->toArray();
            
            $temuanBerjadwal = Temuan::where('id_permintaan', $id)
                ->whereIn('tanggal_temuan', $selectedDates)
                ->get();
            
            $permintaan->jadwal_audits = $selectedJadwals;
            $permintaan->temuan = $temuanBerjadwal;
        } else {
            $temuan = Temuan::where('id_permintaan', $id)->get();
            $permintaan->temuan = $temuan;
        }

        $pdf = Pdf::loadView('pdf.permintaan', compact('permintaan'));
        return $pdf->stream('permintaan-' . $id . '.pdf');
    }

}