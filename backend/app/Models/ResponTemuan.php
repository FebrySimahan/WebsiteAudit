<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResponTemuan extends Model
{
    protected $primaryKey = 'id_respon';
    protected $fillable = [
        'id_temuan',
        'id_auditee',
        'status_respon',
        'alasan_penolakan',
        'tanggal_respon',
    ];

    public function temuan(): BelongsTo
    {
        return $this->belongsTo(Temuan::class, 'id_temuan', 'id_temuan');
    }

    public function auditee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_auditee', 'id');
    }

    public function tindakLanjuts(): HasMany
    {
        return $this->hasMany(TindakLanjut::class, 'id_respon', 'id_respon');
    }
}
