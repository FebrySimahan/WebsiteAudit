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
        Schema::create('surat_tugas_pemeriksaans', function (Blueprint $table) {
            $table->bigIncrements('id_surat');
            
            $table->foreignId('id_auditor')
                  ->constrained('users')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');
            
            $table->string('unit_kerja');
            $table->string('tujuan_audit');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_tugas_pemeriksaans');
    }
};
