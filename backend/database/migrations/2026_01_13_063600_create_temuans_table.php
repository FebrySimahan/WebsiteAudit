<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('temuans', function (Blueprint $table) {
            $table->id('id_temuan');
            $table->unsignedBigInteger('id_permintaan');
            $table->unsignedBigInteger('id_auditor');
            $table->unsignedBigInteger('id_auditee');
            $table->date('tanggal_temuan');
            $table->string('judul_temuan');
            $table->text('kondisi_sebenarnya');
            $table->text('keadaan_seharusnya');
            $table->text('penyebab');
            $table->text('dampak');
            $table->text('rekomendasi');
            $table->enum('tingkat_keparahan', ['Rendah', 'Sedang', 'Tinggi'])->default('Sedang');
            $table->enum('status_temuan', ['Terbuka', 'Menunggu Tindaklanjut', 'Menunggu Verifikasi', 'Selesai'])->default('Terbuka');
            $table->timestamps();

            $table->foreign('id_permintaan')
                ->references('id_permintaan')
                ->on('permintaan_datas')
                ->onDelete('restrict')
                ->onUpdate('cascade');

            $table->foreign('id_auditor')
                ->references('id')
                ->on('users')
                ->onDelete('restrict')
                ->onUpdate('cascade');

            $table->foreign('id_auditee')
                ->references('id')
                ->on('users')
                ->onDelete('restrict')
                ->onUpdate('cascade');
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('temuans');
    }
};
