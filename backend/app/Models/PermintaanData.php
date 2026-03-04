<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PermintaanData extends Model
{
    protected $table = 'permintaan_datas';
    protected $primaryKey = 'id_permintaan';

    protected $fillable = [
        'id_surat',
        'id_auditor',
        'id_auditee',
        'judul_permintaan',
        'deskripsi',
        'divisi',
        'jenis_permintaan',
        'status_permintaan',
        'level_role',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    
    public function auditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_auditor');
    }

   
    public function auditee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_auditee');
    }

    public function surat(): BelongsTo
    {
        return $this->belongsTo(SuratTugasPemeriksaan::class, 'id_surat');
    }


    public function jadwal_audits(): HasMany
    {
        return $this->hasMany(JadwalAudit::class, 'id_permintaan', 'id_permintaan');
    }

    public function temuans(): HasMany
    {
        return $this->hasMany(Temuan::class, 'id_permintaan', 'id_permintaan');
    }
}
