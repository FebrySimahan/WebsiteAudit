<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TemuanController;
use App\Http\Controllers\ResponTemuanController;
use App\Http\Controllers\TindakLanjutController;
use App\Http\Controllers\SuratTugasController;
use App\Http\Controllers\VerifikasiController;
use App\Http\Controllers\ScoreboardController;
use App\Http\Controllers\PermintaanDataController;
use App\Http\Controllers\PdfController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/users/auditees', [UserController::class, 'getAuditees']);
    Route::get('/scoreboard', [ScoreboardController::class, 'index']);
    
    Route::prefix('temuan')->group(function () {
        Route::get('/', [TemuanController::class, 'index']);                   
        Route::get('/verif', [TemuanController::class, 'indexByVerif']);                   
        Route::get('/search', [TemuanController::class, 'searchByJudul']);
        Route::get('/filter-keparahan', [TemuanController::class, 'filterByKeparahan']);
        Route::get('/filter-status', [TemuanController::class, 'filterByStatus']);
        Route::get('/show-auditee-role', [TemuanController::class, 'showByAuditeeRole']);
        Route::get('/show-by-id-auditee', [TemuanController::class, 'showByIdAuditee']);
        Route::post('/create-temuan', [TemuanController::class, 'createTemuan']);           
        Route::get('/{id}/pdf', [PdfController::class, 'generateTemuan']);
        Route::get('/count-by-status', [TemuanController::class, 'countByStatus']);
        Route::post('/{id}/finalize', [VerifikasiController::class, 'finalizeTemuan']);
    });
    
    Route::prefix('respon-temuans')->group(function () {
        Route::get('/', [ResponTemuanController::class, 'index']);
        Route::post('/create', [ResponTemuanController::class, 'create']);
    });
    
    
    Route::prefix('tindak-lanjut')->group(function () {
        Route::get('/', [TindakLanjutController::class, 'index']);
        Route::get('/by-temuan/{idTemuan}', [TindakLanjutController::class, 'getByTemuan']);
        Route::post('/createTindakLanjut', [TindakLanjutController::class, 'tombolTindaklanjut']);           
    });

    Route::prefix('surat-tugas')->group(function () {
        Route::get('/', [SuratTugasController::class, 'index']);
        Route::get('/for-temuan-page', [SuratTugasController::class, 'indexForTemuanPage']);
        Route::get('/search', [SuratTugasController::class, 'search']);
        Route::post('/create', [SuratTugasController::class, 'create']);
        Route::get('/{id}/pdf', [PdfController::class, 'generateSuratTugas']);
    });
    

    Route::prefix('verifikasi')->group(function () {   
        Route::post('/create', [VerifikasiController::class, 'createVerifikasi']);
        Route::post('/{id}/update', [VerifikasiController::class, 'updateVerifikasi']);
    });

    Route::prefix('permintaan-data')->group(function () {
        Route::get('/show-all-paginated', [PermintaanDataController::class, 'index']);         
        Route::get('/show-all-dropdown', [PermintaanDataController::class, 'indexDropdown']);         
        
        // punya auditor - spesifik path dulu
        Route::get('/auditor/search', [PermintaanDataController::class, 'searchByJudulAuditor']);
        Route::get('/auditor/filter-status', [PermintaanDataController::class, 'filterByStatus']);
        Route::get('/auditor-temuan', [PermintaanDataController::class, 'indexByAuditorTemuan']);
        Route::post('/auditor/create', [PermintaanDataController::class, 'createPermintaanData']);
        Route::get('/auditor', [PermintaanDataController::class, 'index']);
        Route::get('/auditor/{id}/pdf-preview', [PdfController::class, 'previewPermintaanDataAuditor']);
        Route::get('/auditor/{id}/pdf', [PdfController::class, 'generatePermintaanData']);
         Route::post('/{id}/set-selesai', [PermintaanDataController::class, 'setSelesai']);
        Route::post('/{id}/send-ikhtisar', [PermintaanDataController::class, 'sendIkhtisar']);

        // punya auditee - spesifik path dulu
        Route::get('/auditee/ikhtisar', [PermintaanDataController::class, 'auditeeIkhtisarTemuan']);
        Route::get('/auditee/{id}/pdf-preview', [PdfController::class, 'previewPermintaanDataAuditee']);
        Route::get('/auditee/{id}/pdf', [PdfController::class, 'generatePermintaanDataAuditee']);

        // punya direksiss
        Route::get('/search', [PermintaanDataController::class, 'searchByJudul']);          
        Route::get('/direksi/filter-status', [PermintaanDataController::class, 'filterByStatus']);
        Route::get('/status-aktif', [PermintaanDataController::class, 'statusAktif']);
        Route::get('/status-berjalan', [PermintaanDataController::class, 'statusBerjalan']);
        Route::get('/status-selesai', [PermintaanDataController::class, 'statusSelesai']);
        Route::get('/{id}/pdf', [PdfController::class, 'generatePermintaanData']);
        
    
    });


});

