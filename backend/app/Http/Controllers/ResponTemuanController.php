<?php

namespace App\Http\Controllers;

use App\Models\ResponTemuan;
use App\Models\Temuan;
use App\Models\PermintaanData;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Exception;

class ResponTemuanController extends Controller
{


    public function create(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'id_temuan' => 'required|exists:temuans,id_temuan',
                'id_auditee' => 'required|exists:users,id',
                'status_respon' => 'required|in:Diterima,Ditolak',
                'tanggal_respon' => 'required|date',
            ]);

            $responTemuan = ResponTemuan::create($validated);
            
            if ($validated['status_respon'] === 'Diterima') {
                Temuan::where('id_temuan', $validated['id_temuan'])
                    ->update(['status_temuan' => 'Menunggu Tindaklanjut']);
                
                $temuan = Temuan::find($validated['id_temuan']);
                if ($temuan && $temuan->id_permintaan) {
                    PermintaanData::where('id_permintaan', $temuan->id_permintaan)
                        ->where('status_permintaan', '!=', 'Selesai')
                        ->update(['status_permintaan' => 'Berjalan']);
                    
                }
            } elseif ($validated['status_respon'] === 'Ditolak') {
                Temuan::where('id_temuan', $validated['id_temuan'])
                    ->update(['status_temuan' => 'Selesai']);
                   
            
                // in case aja kalo misalnya data terakhir ditolak 
                // (bakal diupdate jadi selesai) permintaan datanya auto selesai gitu
                // $temuan = Temuan::find($validated['id_temuan']);
                // if ($temuan && $temuan->id_permintaan) {
                //     $totalTemuan = Temuan::where('id_permintaan', $temuan->id_permintaan)->count();
                //     $temuanSelesai = Temuan::where('id_permintaan', $temuan->id_permintaan)
                //         ->where('status_temuan', 'Selesai')->count();
                //     if ($totalTemuan > 0 && $temuanSelesai === $totalTemuan) {
                //         PermintaanData::where('id_permintaan', $temuan->id_permintaan)
                //             ->update(['status_permintaan' => 'Selesai']);
                //     }
                // }
            }

            return response()->json([
                'success' => true,
                'message' => 'Respon temuan berhasil dibuat',
                'data' => $responTemuan
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat respon temuan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
