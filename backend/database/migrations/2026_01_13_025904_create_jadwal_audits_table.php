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
        Schema::create('jadwal_audits', function (Blueprint $table) {
            $table->id('id_jadwal');
            $table->unsignedBigInteger('id_permintaan');
            $table->date('tanggal_audit');
            $table->enum('status_jadwal', ['Belum', 'Selesai'])->default('Belum');
            $table->timestamps();

            $table->foreign('id_permintaan')
                ->references('id_permintaan')
                ->on('permintaan_datas')
                ->onDelete('restrict')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_audits');
    }
};
