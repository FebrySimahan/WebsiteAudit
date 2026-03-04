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
        Schema::create('respon_temuans', function (Blueprint $table) {
            $table->id('id_respon');
            $table->unsignedBigInteger('id_temuan');
            $table->unsignedBigInteger('id_auditee');
            $table->enum('status_respon', ['Diterima', 'Ditolak']);
            $table->date('tanggal_respon');
            $table->timestamps();

            // Foreign Keys
            $table->foreign('id_temuan')
                ->references('id_temuan')
                ->on('temuans')
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
        Schema::dropIfExists('respon_temuans');
    }
};
