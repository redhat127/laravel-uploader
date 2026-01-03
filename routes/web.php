<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::prefix('upload')
    ->name('upload.')
    ->controller(UploadController::class)
    ->group(function () {
        Route::post('/chunk', 'chunk')->name('chunk');
        Route::post('/abort', 'abort')->name('abort');
        Route::get('/{upload}/download', 'download')->name('download');
    });
