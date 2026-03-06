<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JadwalAudit extends Model
{
    protected $table = 'jadwal_audits';
    protected $primaryKey = 'id_jadwal';
    public $timestamps = true;

    protected $fillable = [
        'id_permintaan',
        'tanggal_audit',
        'status_jadwal'
    ];

    protected $casts = [
        'tanggal_audit' => 'date:Y-m-d',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function permintaanData(): BelongsTo
    {
        return $this->belongsTo(PermintaanData::class, 'id_permintaan');
    }
}
