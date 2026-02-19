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
        Schema::create('verifikasis', function (Blueprint $table) {
            $table->id('id_verifikasi');
            $table->unsignedBigInteger('id_tindak_lanjut');
            $table->unsignedBigInteger('id_auditor');
            $table->enum('status_verifikasi', ['Diterima', 'Ditolak'])->nullable();
            $table->text('catatan')->nullable();
            $table->date('tanggal_verifikasi')->nullable();
            $table->timestamps();

            $table->foreign('id_tindak_lanjut')
                ->references('id_tindak_lanjut')
                ->on('tindak_lanjuts')
                ->onDelete('restrict')
                ->onUpdate('cascade');

            $table->foreign('id_auditor')
                ->references('id')
                ->on('users')
                ->onDelete('restrict')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verifikasis');
    }
};
