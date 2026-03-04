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
        Schema::dropIfExists('permintaan_datas');
        
        Schema::create('permintaan_datas', function (Blueprint $table) {
            $table->bigIncrements('id_permintaan');
            
         
            $table->unsignedBigInteger('id_surat');
            $table->foreign('id_surat')
                  ->references('id_surat')
                  ->on('surat_tugas_pemeriksaans')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');
            
            $table->foreignId('id_auditor')
                  ->constrained('users')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');
            
            $table->foreignId('id_auditee')
                  ->constrained('users')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');
            
            $table->string('level_role');
            $table->string('judul_permintaan');
            $table->text('deskripsi');
            $table->enum('divisi')->default('Operasional');
            $table->enum('jenis_permintaan');
            $table->enum('status_permintaan', ['Aktif', 'Berjalan', 'Selesai'])->default('Aktif');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permintaan_datas');
    }
};
