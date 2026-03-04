<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SuratTugasPemeriksaan;

class SuratTugasController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 5);
        
        $suratTugas = SuratTugasPemeriksaan::orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'message' => 'Daftar surat tugas pemeriksaan',
            'data' => $suratTugas->items(),
            'pagination' => [
                'current_page' => $suratTugas->currentPage(),
                'last_page' => $suratTugas->lastPage(),
                'per_page' => $suratTugas->perPage(),
                'total' => $suratTugas->total(),
            ],
        ]);
    }

    public function indexForTemuanPage(Request $request)
    {
        
        $suratTugas = SuratTugasPemeriksaan::orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'message' => 'Daftar surat tugas pemeriksaan',
            'data' => $suratTugas,
            'pagination' => [

            ],
        ]);
    }

    public function search(Request $request)
    {
        $unitKerja = $request->query('unit_kerja', '');

        $suratTugas = SuratTugasPemeriksaan::where('unit_kerja', 'like', '%' . $unitKerja . '%')
            ->get();

        return response()->json([
            'message' => 'Hasil pencarian surat tugas',
            'data' => $suratTugas
        ]);
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'id_auditor' => 'required|integer',
            'unit_kerja' => 'required|string|max:255',
            'tujuan_audit' => 'required|string',
            'deskripsi_permintaan' => 'required|string',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
        ]);

        //kalo tujuan atau deskripsi pengen panjang, didatabase tmbain aja jumlah varcharny

        $suratTugas = SuratTugasPemeriksaan::create($validated);

        return response()->json([
            'message' => 'Surat tugas pemeriksaan berhasil dibuat',
            'data' => $suratTugas
        ], 201);
    }
}

