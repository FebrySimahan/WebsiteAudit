<?php

namespace App\Http\Controllers;

use App\Models\TindakLanjut;
use App\Models\Temuan;
use App\Models\ResponTemuan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TindakLanjutController extends Controller
{
    public function index(): JsonResponse
    {
        $tindakLanjuts = TindakLanjut::with(['temuan'])->get();
        return response()->json($tindakLanjuts);
    }

    public function tombolTindaklanjut(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_temuan' => 'required|exists:temuans,id_temuan',
            'deskripsi_tindak_lanjut' => 'required|string',
            'tanggal_komitmen' => 'required|date',
            'status' => 'nullable|in:Proses,Selesai',
        ]);

      
        $respon = ResponTemuan::where('id_temuan', $validated['id_temuan'])
            ->where('status_respon', 'Diterima')
            ->first();

        if (!$respon) {
            return response()->json([
                'success' => false,
                'message' => 'Respon temuan tidak ditemukan atau belum diterima',
            ], 404);
        }

        $tindakLanjut = TindakLanjut::create([
            'id_respon' => $respon->id_respon,
            'id_auditee' => $respon->id_auditee,
            'deskripsi_tindak_lanjut' => $validated['deskripsi_tindak_lanjut'],
            'tanggal_komitmen' => $validated['tanggal_komitmen'],
            'status' => $validated['status'] ?? 'Proses',
        ]);

        Temuan::where('id_temuan', $validated['id_temuan'])
            ->update(['status_temuan' => 'Menunggu Verifikasi']);

        return response()->json([
            'success' => true,
            'data' => $tindakLanjut,
            'message' => 'Tindak lanjut berhasil dibuat',
        ], 201);
    }

    public function getByTemuan($idTemuan): JsonResponse
    {
        try {
            $tindakLanjut = TindakLanjut::with(['responTemuan', 'auditee'])
                ->whereHas('responTemuan', function ($query) use ($idTemuan) {
                    $query->where('id_temuan', $idTemuan);
                })
                ->first();

            if (!$tindakLanjut) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tindak lanjut tidak ditemukan',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $tindakLanjut,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data: ' . $e->getMessage(),
            ], 500);
        }
    }
}