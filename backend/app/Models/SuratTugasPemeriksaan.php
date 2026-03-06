<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuratTugasPemeriksaan extends Model
{
    protected $table = 'surat_tugas_pemeriksaans';
    
    // Set primary key
    protected $primaryKey = 'id_surat';

    
    protected $fillable = [
        'id_auditor',
        'unit_kerja',
        'tujuan_audit',
        'deskripsi_permintaan',
        'tanggal_mulai',
        'tanggal_selesai',
    ];

    
    protected $casts = [
        'tanggal_mulai' => 'date:Y-m-d',
        'tanggal_selesai' => 'date:Y-m-d',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function auditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_auditor');
    }
}
