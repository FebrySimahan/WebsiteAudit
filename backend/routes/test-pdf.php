<?php

use App\Models\PermintaanData;
use App\Models\Temuan;

// Get first permintaan with jadwal and temuans
$permintaan = PermintaanData::with(['jadwal_audits', 'temuans'])
    ->where('cek_verif', 1)
    ->first();

if ($permintaan) {
    $output = [
        'permintaan_id' => $permintaan->id_permintaan,
        'judul' => $permintaan->judul_permintaan,
        'level_role' => $permintaan->level_role,
        'jadwal_count' => $permintaan->jadwal_audits->count(),
        'temuan_count' => $permintaan->temuans->count(),
        'jadwals' => $permintaan->jadwal_audits->map(fn($j) => [
            'id' => $j->id_jadwal,
            'tanggal' => $j->tanggal_audit->format('Y-m-d')
        ])->toArray(),
        'temuans' => $permintaan->temuans->map(fn($t) => [
            'id' => $t->id_temuan,
            'tanggal' => $t->tanggal_temuan->format('Y-m-d'),
            'judul' => $t->judul_temuan
        ])->toArray(),
    ];
    
    header('Content-Type: application/json');
    echo json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
} else {
    echo "No permintaan found with cek_verif = 1";
}
