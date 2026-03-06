<?php

namespace App\Http\Controllers;

use App\Models\Verifikasi;
use App\Models\Temuan;
use App\Models\PermintaanData;
use App\Models\TindakLanjut;
use App\Models\JadwalAudit;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class VerifikasiController extends Controller
{
    /**
     * Verifikasi tindak lanjut
     */

    public function updateVerifikasi(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'catatan' => 'nullable|string',
            ]);

            $verifikasi = Verifikasi::find($id);
            if (!$verifikasi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Verifikasi tidak ditemukan',
                ], 404);
            }

            $validated['id_auditor'] = $request->user()->id;

            $verifikasi->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Verifikasi berhasil diupdate',
                'data' => $verifikasi
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate verifikasi: ' . $e->getMessage(),
            ], 500);
        }
    }
    public function createVerifikasi(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'id_tindak_lanjut' => 'required|exists:tindak_lanjuts,id_tindak_lanjut',
                'status_verifikasi' => 'required|in:Diterima,Ditolak',
                'catatan' => 'nullable|string',
                'tanggal_verifikasi' => 'required|date',
            ]);

            $tindakLanjut = TindakLanjut::find($validated['id_tindak_lanjut']);
            if (!$tindakLanjut) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tindak lanjut tidak ditemukan',
                ], 404);
            }


            $validated['id_auditor'] = $request->user()->id;

            $verifikasi = Verifikasi::where('id_tindak_lanjut', $validated['id_tindak_lanjut'])->first();
            if ($verifikasi) {
                $verifikasi->update([
                    'status_verifikasi' => $validated['status_verifikasi'],
                    'catatan' => $validated['catatan'],
                    'tanggal_verifikasi' => $validated['tanggal_verifikasi'],
                    'id_auditor' => $validated['id_auditor'],
                ]);
            } else {
                $verifikasi = Verifikasi::create($validated);
            }

            $idTemuan = $tindakLanjut->responTemuan->id_temuan ?? null;

            if ($idTemuan) {
                if ($validated['status_verifikasi'] === 'Diterima') {
                    try {
                        $tindakLanjut->update(['status' => 'Selesai']);
                    } catch (\Exception $e) {
                        \Log::error('Gagal mengupdate status tindak lanjut: ' . $e->getMessage());
                    }

                    // Status temuan tetap "Menunggu Verifikasi", tidak langsung berubah ke "Selesai"
                    // Temuan akan diubah menjadi "Selesai" melalui endpoint khusus
                } else {
                    Temuan::where('id_temuan', $idTemuan)
                        ->update(['status_temuan' => 'Menunggu Tindaklanjut']);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Verifikasi berhasil dibuat',
                'data' => $verifikasi
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat verifikasi: ' . $e->getMessage(),
            ], 500);
        }
    }




    private function updateTemuanStatusWhenVerified($idTemuan)
    {
        try {
            $temuan = Temuan::find($idTemuan);
            if (!$temuan) return;
            
            $temuan->update(['status_temuan' => 'Selesai']);
            $idPermintaan = $temuan->id_permintaan;

            if (!$idPermintaan) return;
            
            $temuanBelumSelesai = Temuan::where('id_permintaan', $idPermintaan)
                ->where('status_temuan', '!=', 'Selesai')
                ->count();

            // Dihapus: auto update status_permintaan menjadi Selesai
        } catch (\Exception $e) {
        }
    }

    /**
     * Selesaikan temuan (update status ke Selesai)
     */
    public function finalizeTemuan(Request $request, $id): JsonResponse
    {
        try {
            $temuan = Temuan::find($id);
            if (!$temuan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Temuan tidak ditemukan',
                ], 404);
            }

            // Hanya bisa diselesaikan jika statusnya "Menunggu Verifikasi"
            if ($temuan->status_temuan !== 'Menunggu Verifikasi') {
                return response()->json([
                    'success' => false,
                    'message' => 'Temuan hanya bisa diselesaikan dari status Menunggu Verifikasi',
                ], 400);
            }

            // Cek apakah verifikasi sudah diterima
            // Jika ada tindak lanjut, verifikasi harus diterima sebelum dapat diselesaikan
            if ($temuan->responTemuan && $temuan->responTemuan->tindakLanjut) {
                $verifikasi = Verifikasi::where('id_tindak_lanjut', $temuan->responTemuan->tindakLanjut->id_tindak_lanjut)->first();
                if (!$verifikasi || $verifikasi->status_verifikasi !== 'Diterima') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Verifikasi harus diterima terlebih dahulu sebelum menyelesaikan temuan',
                    ], 400);
                }
            }

            $temuan->update(['status_temuan' => 'Selesai']);

            // Update jadwal audit status to Selesai dengan tanggal yang sama dengan tanggal_temuan
            if ($temuan->id_permintaan && $temuan->tanggal_temuan) {
                // Konversi tanggal untuk perbandingan
                $tanggalTemuanString = $temuan->tanggal_temuan instanceof \DateTime 
                    ? $temuan->tanggal_temuan->format('Y-m-d')
                    : \Carbon\Carbon::parse($temuan->tanggal_temuan)->format('Y-m-d');
                
                \Log::info('VerifikasiController::finalizeTemuan - UPDATE JADWAL', [
                    'id_temuan' => $temuan->id_temuan,
                    'id_permintaan' => $temuan->id_permintaan,
                    'tanggal_temuan' => $tanggalTemuanString,
                    'type_tanggal_temuan' => gettype($temuan->tanggal_temuan)
                ]);
                
                // Update jadwal audit yang cocok
                $updated = JadwalAudit::where('id_permintaan', $temuan->id_permintaan)
                    ->whereRaw("DATE_FORMAT(tanggal_audit, '%Y-%m-%d') = ?", [$tanggalTemuanString])
                    ->update(['status_jadwal' => 'Selesai']);
                
                \Log::info('VerifikasiController::finalizeTemuan - UPDATE RESULT', [
                    'rows_updated' => $updated
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Temuan berhasil diselesaikan dan jadwal audit telah diupdate',
                'data' => $temuan
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyelesaikan temuan: ' . $e->getMessage(),
            ], 500);
        }
    }
}

