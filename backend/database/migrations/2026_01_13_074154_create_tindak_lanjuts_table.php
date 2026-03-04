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
        Schema::create('tindak_lanjuts', function (Blueprint $table) {
            $table->id('id_tindak_lanjut');
            $table->unsignedBigInteger('id_respon');
            $table->unsignedBigInteger('id_auditee');
            $table->text('deskripsi_tindak_lanjut');
            $table->date('deskripsi_komitmen');
            $table->enum('status', ['Proses', 'Selesai'])->default('Proses');
            $table->timestamps();

            // Foreign Keys
            $table->foreign('id_respon')
                ->references('id_respon')
                ->on('respon_temuans')
                ->onDelete('restrict')
                ->onUpdate('cascade');

            $table->foreign('id_auditee')
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
        Schema::dropIfExists('tindak_lanjuts');
    }
};
