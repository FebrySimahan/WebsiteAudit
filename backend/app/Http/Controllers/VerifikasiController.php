<?php

namespace App\Http\Controllers;

use App\Models\Verifikasi;
use App\Models\Temuan;
use App\Models\PermintaanData;
use App\Models\TindakLanjut;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class VerifikasiController extends Controller
{
    /**
     * Verifikasi tindak lanjut
     */
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

                    $this->updateTemuanStatusWhenVerified($idTemuan);
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
}
