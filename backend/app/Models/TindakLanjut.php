<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TindakLanjut extends Model
{
    protected $primaryKey = 'id_tindak_lanjut';
    protected $fillable = [
        'id_respon',
        'id_auditee',
        'deskripsi_tindak_lanjut',
        'tanggal_komitmen',
        'status',
    ];

    public function responTemuan(): BelongsTo
    {
        return $this->belongsTo(ResponTemuan::class, 'id_respon', 'id_respon');
    }

    public function auditee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_auditee', 'id');
    }

    public function verifikasis(): HasMany
    {
        return $this->hasMany(Verifikasi::class, 'id_tindak_lanjut', 'id_tindak_lanjut');
    }
}
