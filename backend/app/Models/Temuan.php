<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Temuan extends Model
{
    protected $table = 'temuans';
    protected $primaryKey = 'id_temuan';

    protected $fillable = [
        'id_permintaan',
        'id_auditor',
        'id_auditee',
        'tanggal_temuan',
        'judul_temuan',
        'kondisi_sebenarnya',
        'keadaan_seharusnya',
        'penyebab',
        'dampak',
        'rekomendasi',
        'tingkat_keparahan',
        'status_temuan',
        'level_role',
    ];

    protected $casts = [
        'tanggal_temuan' => 'date:Y-m-d',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    
    public function permintaanData(): BelongsTo
    {
        return $this->belongsTo(PermintaanData::class, 'id_permintaan');
    }

    
    public function auditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_auditor');
    }

   
    public function auditee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_auditee');
    }

    
    public function responTemuans(): HasMany
    {
        return $this->hasMany(ResponTemuan::class, 'id_temuan', 'id_temuan');
    }
}
