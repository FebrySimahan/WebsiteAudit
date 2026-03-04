<?php

namespace App\Http\Controllers;

use App\Models\PermintaanData;
use App\Models\User;
use App\Models\JadwalAudit;
use Illuminate\Http\Request;

class PermintaanDataController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 5);
            $page = $request->input('page', 1);

            $permintaanDatas = PermintaanData::with('auditor', 'auditee', 'surat', 'jadwal_audits')
            ->orderBy('created_at', 'desc')     
            ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $permintaanDatas->items(),
                'pagination' => [
                    'current_page' => $permintaanDatas->currentPage(),
                    'last_page' => $permintaanDatas->lastPage(),
                    'per_page' => $permintaanDatas->perPage(),
                    'total' => $permintaanDatas->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data permintaan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function indexDropdown(Request $request)
    {
        try {
            $permintaanDatas = PermintaanData::with('auditor', 'auditee', 'surat', 'jadwal_audits')
            ->orderBy('created_at', 'desc')    
            ->get();

            return response()->json([
                'success' => true,
                'data' => $permintaanDatas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data permintaan: ' . $e->getMessage(),
            ], 500);
        }
    }

        /**
     * Update status permintaan data menjadi Selesai
     */
    public function setSelesai($id)
    {
        $permintaan = PermintaanData::find($id);
        if (!$permintaan) {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan data tidak ditemukan',
            ], 404);
        }
        $permintaan->status_permintaan = 'Selesai';
        $permintaan->save();
        return response()->json([
            'success' => true,
            'message' => 'Status permintaan data berhasil diubah menjadi Selesai',
            'data' => $permintaan
        ]);
    }

    public function indexByAuditor(Request $request)
    {
        try {
            

            $permintaanDatas = PermintaanData::with('auditor', 'auditee', 'surat', 'jadwal_audits');

            return response()->json([
                'success' => true,
                'data' => $permintaanDatas->items(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data permintaan: ' . $e->getMessage(),
            ], 500);
        }
    }
    public function searchByJudul(Request $request)
    {
        $judul = $request->input('judul');

        try {
            $permintaanDatas = PermintaanData::with('auditor', 'auditee', 'surat', 'jadwal_audits')
                ->where('judul_permintaan', 'LIKE', '%' . $judul . '%')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $permintaanDatas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencari data permintaan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function statusAktif()
    {
        try {
            $permintaanDatas = PermintaanData::with('auditor', 'auditee', 'surat', 'jadwal_audits')
                ->where('status_permintaan', 'Aktif')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $permintaanDatas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data permintaan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function statusBerjalan()
    {
        try {
            $permintaanDatas = PermintaanData::with('auditor', 'auditee', 'surat', 'jadwal_audits')
                ->where('status_permintaan', 'Berjalan')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $permintaanDatas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data permintaan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function statusSelesai()
    {
        try {
            $permintaanDatas = PermintaanData::with('auditor', 'auditee', 'surat', 'jadwal_audits')
                ->where('status_permintaan', 'Selesai')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $permintaanDatas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data permintaan: ' . $e->getMessage(),
            ], 500);
        }
    }

    // public function indexByAuditor(Request $request)
    // {
    //     try {
    //         $userId = auth()->id();
    //         $perPage = $request->input('per_page', 5);
            
    //         $permintaanDatas = PermintaanData::with(['auditor', 'auditee', 'surat', 'jadwal_audits'])
    //             ->where('id_auditor', $userId)
    //             ->paginate($perPage);

    //         return response()->json([
    //             'success' => true,
    //             'data' => $permintaanDatas->items(),
    //             'pagination' => [
    //                 'current_page' => $permintaanDatas->currentPage(),
    //                 'last_page' => $permintaanDatas->lastPage(),
    //                 'per_page' => $permintaanDatas->perPage(),
    //                 'total' => $permintaanDatas->total(),
    //             ],
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Gagal mengambil data permintaan: ' . $e->getMessage(),
    //         ], 500);
    //     }
    // }    
    
    
    public function searchByJudulAuditor(Request $request)
    {
        $judul = $request->input('judul');

        try {
            $permintaanDatas = PermintaanData::with('auditor', 'auditee', 'surat', 'jadwal_audits')
                ->where('judul_permintaan', 'LIKE', '%' . $judul . '%')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $permintaanDatas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencari data permintaan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function filterByDivisiAuditor(Request $request)
    {
        $divisi = $request->input('divisi');

        try {
            $permintaanDatas = PermintaanData::with('auditor', 'auditee', 'surat', 'jadwal_audits')
                ->where('divisi', $divisi)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $permintaanDatas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal filter data permintaan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function filterByStatus(Request $request)
    {
        $status = $request->input('status');
        $perPage = $request->input('per_page', 5);

        try {
            $permintaanDatas = PermintaanData::with('auditor', 'auditee', 'surat', 'jadwal_audits')
                ->where('status_permintaan', $status)
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $permintaanDatas->items(),
                'pagination' => [
                    'current_page' => $permintaanDatas->currentPage(),
                    'last_page' => $permintaanDatas->lastPage(),
                    'per_page' => $permintaanDatas->perPage(),
                    'total' => $permintaanDatas->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal filter data permintaan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function createPermintaanData(Request $request)
    {
        try {
            $userId = auth()->id();

            $validated = $request->validate([
                'id_surat' => 'required|integer|exists:surat_tugas_pemeriksaans,id_surat',
                'judul_permintaan' => 'required|string|max:255',
                'deskripsi' => 'required|string',
                'divisi' => 'required|string',
                'level_role' => 'required|string',
                'jenis_permintaan' => 'required|string',
                'jadwal_audit' => 'required|array|min:1',
                'jadwal_audit.*' => 'required|date_format:Y-m-d',
            ]);

            $validated['id_auditor'] = $userId;
            $validated['status_permintaan'] = 'Aktif';

            $divisi = strtolower(trim($validated['divisi']));

            if ($divisi === 'kepatuhan') {
                $validated['level_role'] = 'PE';
                $validated['id_auditee'] = 44;
            } elseif (in_array($divisi, ['Manajemen_Remedial', 'manajemen remedial', 'mr'])) {
                $validated['level_role'] = 'PE';
                $validated['id_auditee'] = 27;
            }

         
            $jadwalAuditDates = $validated['jadwal_audit'];
            unset($validated['jadwal_audit']);

            
            $permintaanData = PermintaanData::create($validated);

        
            foreach ($jadwalAuditDates as $date) {
                JadwalAudit::create([
                    'id_permintaan' => $permintaanData->id_permintaan,
                    'tanggal_audit' => $date,
                    'status_jadwal' => 'Belum'
                ]);
            }

            $permintaanData->load('jadwal_audits');

            return response()->json([
                'success' => true,
                'message' => 'Permintaan data berhasil dibuat',
                'data' => $permintaanData
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat permintaan data: ' . $e->getMessage(),
            ], 500);
        }
    }

}

