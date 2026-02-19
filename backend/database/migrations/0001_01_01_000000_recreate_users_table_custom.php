<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    
    public function up(): void
    {
        // Only create if not exists
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->string('employee_code')->nullable();
                $table->string('wa_number', 30)->nullable();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->string('level', 50)->default('STAFF');
                $table->string('level_role', 50)->nullable();
                $table->string('remember_token', 100)->nullable();
                $table->timestamps();
            });
        }
    }

    
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
