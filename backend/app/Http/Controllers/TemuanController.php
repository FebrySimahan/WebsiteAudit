<?php

namespace App\Http\Controllers;

use App\Models\Temuan;
use App\Models\Verifikasi;
use App\Models\User;
use App\Models\PermintaanData;
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
        $status = $request->input('status'); 

        $query = Temuan::with(['permintaanData', 'auditor', 'auditee', 'responTemuans'])
            ->orderBy('created_at', 'desc');

        
        if ($status && $status !== 'all') {
            $query->where('status_temuan', $status);
        }

        // If per_page is -1, return all data without pagination
        if ($perPage == -1) {
            $temuans = $query->get();
            return response()->json([
                'success' => true,
                'data' => $this->transformTemuans($temuans),
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $temuans->count(),
                    'total' => $temuans->count(),
                ],
            ]);
        }

        $temuans = $query->paginate($perPage);

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

    public function indexByVerif(Request $request): JsonResponse
    {
        $temuans = Temuan::with(['permintaanData', 'auditor', 'auditee', 'responTemuans'])
            ->where('status_temuan', 'Menunggu Verifikasi')
            ->orderByRaw("FIELD(status_temuan, 'Terbuka', 'Menunggu Tindaklanjut', 'Menunggu Verifikasi', 'Selesai')")
            ->get();

        return response()->json([
            'success' => true,
            'data' => $this->transformTemuans($temuans),
        ]);
    }

    public function countByStatus(Request $request): JsonResponse
    {
        $status = $request->input('status', 'Terbuka');
        $userId = $request->user()->id;
        $levelRole = $request->user()->level_role;
        
        // PE mapping untuk users yang adalah PE
        $peMapping = [44, 27]; // ID user yang adalah PE
        
        if (in_array($userId, $peMapping)) {
            // PE user - count temuan mereka sendiri berdasarkan id_auditee
            $count = Temuan::where('id_auditee', $userId)
                ->where('status_temuan', $status)
                ->count();
        } else {
            // Non-PE user - count berdasarkan level_role
            $count = Temuan::where('level_role', $levelRole)
                ->where('status_temuan', $status)
                ->count();
        }
        
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
        $perPage = $request->input('per_page', 5);
        $levelRole = $request->user()->level_role;

        try {
            $query = Temuan::with(['permintaanData', 'auditor', 'auditee', 'responTemuans'])
                ->where('level_role', $levelRole)
                ->orderBy('tanggal_temuan', 'desc');

            if ($status && $status !== 'all') {
                $query->where('status_temuan', $status);
            }

            $temuans = $query->paginate($perPage);

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

    public function showByAuditeeRole(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 5);
        $status = $request->input('status');
        $levelRole = $request->user()->level_role;
        try {
            $query = Temuan::with(['permintaanData', 'auditor', 'auditee', 'responTemuans'])
                ->where('level_role', $levelRole)
                ->orderBy('tanggal_temuan', 'desc');

            if ($status && $status !== 'all') {
                $query->where('status_temuan', $status);
            }

            $temuans = $query->orderBy('tanggal_temuan', 'desc')
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

    public function showByIdAuditee(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 5);
        $status = $request->input('status');
        // Use authenticated user's ID, NOT the request parameter
        // This ensures PE users can only see their own temuan
        $idAuditee = $request->user()->id;

        try {
            // Debug log
            \Log::info('showByIdAuditee called', [
                'id_auditee' => $idAuditee,
                'status' => $status,
                'per_page' => $perPage
            ]);

            $query = Temuan::with(['permintaanData', 'auditor', 'auditee', 'responTemuans'])
                ->where('id_auditee', $idAuditee);

            if ($status && $status !== 'all') {
                $query->where('status_temuan', $status);
            }

            $temuans = $query->orderBy('tanggal_temuan', 'desc')
                ->paginate($perPage);

            // Debug log
            \Log::info('Query result', [
                'total' => $temuans->total(),
                'ids' => $temuans->pluck('id_auditee')->toArray()
            ]);

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

    public function createTemuan(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'id_permintaan' => 'nullable|exists:permintaan_datas,id_permintaan',
                'id_auditee' => 'nullable|integer|exists:users,id',
                'tanggal_temuan' => 'required|date_format:Y-m-d',
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
            
            $peUserIds = [27, 44];
            
            if (!empty($validated['id_permintaan'])) {
                $permintaan = PermintaanData::find($validated['id_permintaan']);
                if ($permintaan) {
                    $validated['level_role'] = $permintaan->level_role;
                }
            }
            
            if (!empty($validated['id_auditee']) && in_array($validated['id_auditee'], $peUserIds)) {
                $peMapping = [
                    44 => 'Kepatuhan',
                    27 => 'MR',
                ];
                $validated['level_role'] = $peMapping[$validated['id_auditee']] ?? '';
            } elseif (!empty($validated['id_auditee'])) {
                $auditee = User::find($validated['id_auditee']);
                if ($auditee && empty($validated['level_role'])) {
                    $validated['level_role'] = $auditee->level_role;
                }
            }

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
    
