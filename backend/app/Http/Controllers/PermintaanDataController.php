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

    public function filterByStatusAuditor(Request $request)
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
                'id_auditee' => 'required|integer|exists:users,id',
                'judul_permintaan' => 'required|string|max:255',
                'deskripsi' => 'required|string',
                'divisi' => 'required|in:Operasional,Marketing',
                'jenis_permintaan' => 'required|in:Rutin,Sekali',
                'jadwal_audit' => 'required|array|min:1',
                'jadwal_audit.*' => 'required|date_format:Y-m-d',
            ]);

            $validated['id_auditor'] = $userId;
            $validated['status_permintaan'] = 'Aktif';

         
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

    public function updatePermintaanData(Request $request, $id)
    {
        try {
            $userId = auth()->id();
            
            $permintaanData = PermintaanData::where('id_permintaan', $id)
                ->where('id_auditor', $userId)
                ->firstOrFail();

            $validated = $request->validate([
                'judul_permintaan' => 'sometimes|string|max:255',
                'deskripsi' => 'sometimes|string',
                'divisi' => 'sometimes|in:Operasional,Marketing',
                'jenis_permintaan' => 'sometimes|in:Rutin,Sekali',
                'status_permintaan' => 'sometimes|in:Aktif,Berjalan,Selesai',
            ]);

            $permintaanData->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Permintaan data berhasil diperbarui',
                'data' => $permintaanData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui permintaan data: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function deletePermintaanData($id)
    {
        try {
            $userId = auth()->id();
            
            $permintaanData = PermintaanData::where('id_permintaan', $id)
                ->where('id_auditor', $userId)
                ->firstOrFail();

            $permintaanData->delete();

            return response()->json([
                'success' => true,
                'message' => 'Permintaan data berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus permintaan data: ' . $e->getMessage(),
            ], 500);
        }
    }

}

