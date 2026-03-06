<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Verifikasi extends Model
{
    protected $table = 'verifikasis';
    protected $primaryKey = 'id_verifikasi';
    protected $fillable = [
        'id_tindak_lanjut',
        'id_auditor',
        'status_verifikasi',
        'catatan',
        'tanggal_verifikasi',
    ];

    protected $casts = [
        'tanggal_verifikasi' => 'date:Y-m-d',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function tindakLanjut(): BelongsTo
    {
        return $this->belongsTo(TindakLanjut::class, 'id_tindak_lanjut', 'id_tindak_lanjut');
    }

    public function auditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_auditor', 'id');
    }
}
