<?php

namespace App\Http\Controllers;

use App\Models\Temuan;
use App\Models\Verifikasi;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class TemuanController extends Controller
{
    private function transformTemuans($temuans)
    {
        return $temuans->map(function($t) {
            // Cari tindak lanjut terkait temuan
            $tindakLanjut = null;
            if ($t->responTemuans && count($t->responTemuans) > 0) {
                foreach ($t->responTemuans as $respon) {
                    if ($respon->status_respon === 'Diterima') {
                        $tindakLanjut = \App\Models\TindakLanjut::where('id_respon', $respon->id_respon)->first();
                        break;
                    }
                }
            }
            $verifikasi = null;
            if ($tindakLanjut) {
                $verifikasi = \App\Models\Verifikasi::where('id_tindak_lanjut', $tindakLanjut->id_tindak_lanjut)
                    ->orderBy('tanggal_verifikasi', 'desc')
                    ->first();
            }
            return [
                'id_temuan' => $t->id_temuan,
                'id_permintaan' => $t->id_permintaan,
                'id_auditor' => $t->id_auditor,
                'id_auditee' => $t->id_auditee,
                'tanggal_temuan' => $t->tanggal_temuan,
                'judul_temuan' => $t->judul_temuan,
                'kondisi_sebenarnya' => $t->kondisi_sebenarnya,
                'keadaan_seharusnya' => $t->keadaan_seharusnya,
                'penyebab' => $t->penyebab,
                'dampak' => $t->dampak,
                'rekomendasi' => $t->rekomendasi,
                'tingkat_keparahan' => $t->tingkat_keparahan,
                'status_temuan' => $t->status_temuan,
                'created_at' => $t->created_at,
                'updated_at' => $t->updated_at,
                'responTemuans' => $t->responTemuans ? $t->responTemuans->toArray() : [],
                'permintaanData' => $t->permintaanData,
                'auditor' => $t->auditor,
                'auditee' => $t->auditee,
                'verifikasi' => $verifikasi ? [
                    'status_verifikasi' => $verifikasi->status_verifikasi,
                    'catatan' => $verifikasi->catatan,
                    'tanggal_verifikasi' => $verifikasi->tanggal_verifikasi,
                ] : null,
            ];
        });
    }
   
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 5);
        $page = $request->input('page', 1);

        $temuans = Temuan::with(['permintaanData', 'auditor', 'auditee', 'responTemuans'])
            ->orderBy('tanggal_temuan', 'desc')
            ->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $this->transformTemuans($temuans->getCollection()),
            'pagination' => [
                'current_page' => $temuans->currentPage(),
                'last_page' => $temuans->lastPage(),
                'per_page' => $temuans->perPage(),
                'total' => $temuans->total(),
            ],
        ]);
    }

    public function countByStatus(Request $request): JsonResponse
    {
        $status = $request->input('status', 'Terbuka');
        $count = Temuan::where('status_temuan', $status)->count();
        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }

    public function showByTindaklanjut(): JsonResponse
    {
        $temuans = Temuan::with(['permintaanData', 'auditor', 'auditee', 'responTemuans'])
            ->whereHas('responTemuans', function ($query) {
                $query->where('status_respon', 'Diterima');
            })
            ->get();
        return response()->json([
            'success' => true,
            'data' => $this->transformTemuans($temuans),
        ]);
    }

    public function searchByJudul(Request $request): JsonResponse
    {
        $judul = $request->input('judul');
        
        try {
            $temuans = Temuan::with(['permintaanData', 'auditor', 'auditee', 'responTemuans'])
                ->where('judul_temuan', 'LIKE', '%' . $judul . '%')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $this->transformTemuans($temuans),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencari data temuan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function searchByAuditee(Request $request): JsonResponse
    {
        $judul = $request->input('judul');
        
        try {
            $temuans = Temuan::with(['permintaanData', 'auditor', 'auditee', 'responTemuans'])
                ->where('judul_temuan', 'LIKE', '%' . $judul . '%')
                ->where('id_auditee', $request->user()->id)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $this->transformTemuans($temuans),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencari data temuan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function filterByKeparahan(Request $request): JsonResponse
    {
        $keparahan = $request->input('keparahan');
        $perPage = $request->input('per_page', 5);
        
        try {
            $temuans = Temuan::with(['permintaanData', 'auditor', 'auditee', 'responTemuans'])
                ->where('tingkat_keparahan', $keparahan)
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $this->transformTemuans($temuans->getCollection()),
                'pagination' => [
                    'current_page' => $temuans->currentPage(),
                    'last_page' => $temuans->lastPage(),
                    'per_page' => $temuans->perPage(),
                    'total' => $temuans->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data temuan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function filterByStatus(Request $request): JsonResponse
    {
        $status = $request->input('status');
        
        try {
            $temuans = Temuan::with(['permintaanData', 'auditor', 'auditee', 'responTemuans'])
                ->where('status_temuan', $status)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $this->transformTemuans($temuans),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data temuan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function showByAuditeeRole(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 5);
        $levelRole = $request->user()->level_role;
        try {
            $temuans = Temuan::with(['permintaanData', 'auditor', 'auditee', 'responTemuans'])
                ->whereHas('auditee', function ($query) use ($levelRole) {
                    $query->where('level_role', $levelRole);
                })
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $this->transformTemuans($temuans->getCollection()),
                'pagination' => [
                    'current_page' => $temuans->currentPage(),
                    'last_page' => $temuans->lastPage(),
                    'per_page' => $temuans->perPage(),
                    'total' => $temuans->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data temuan: ' . $e->getMessage(),
                'error' => $e->getTrace(),
            ], 500);
        }
    }

    public function tombolRespon(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_temuan' => 'required|exists:temuans,id_temuan',
            'id_auditee' => 'required|exists:users,id',
            'status_respon' => 'required|in:Diterima,Ditolak',
            'alasan_penolakan' => 'nullable|string',
            'tanggal_respon' => 'required|date',
        ]);

        $responTemuan = ResponTemuan::create($validated);


        if ($validated['status_respon'] === 'Diterima') {
            Temuan::where('id_temuan', $validated['id_temuan'])
                ->update(['status_temuan' => 'Menunggu Tindaklanjut']);
        } elseif ($validated['status_respon'] === 'Ditolak') {
            Temuan::where('id_temuan', $validated['id_temuan'])
                ->update(['status_temuan' => 'Selesai']);
        }

        return response()->json($responTemuan, 201);
    }

    public function createTemuan(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'id_permintaan' => 'nullable|exists:permintaan_datas,id_permintaan',
                'id_auditee' => 'required|integer|exists:users,id',
                'tanggal_temuan' => 'required|date',
                'judul_temuan' => 'required|string',
                'kondisi_sebenarnya' => 'required|string',
                'keadaan_seharusnya' => 'required|string',
                'penyebab' => 'required|string',
                'dampak' => 'required|string',
                'rekomendasi' => 'required|string',
                'tingkat_keparahan' => 'required|in:Rendah,Sedang,Tinggi',
            ]);

            $validated['id_auditor'] = $request->user()->id;
            $validated['status_temuan'] = 'Terbuka';

            $temuan = Temuan::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Temuan berhasil dibuat',
                'data' => $temuan
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Temuan create error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat temuan: ' . $e->getMessage(),
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    


    
}
    
