<?php

use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('home');
})->name('home');

Route::prefix('upload')
    ->name('upload.')
    ->controller(UploadController::class)
    ->group(function () {
        Route::post('/chunk', 'chunk')->name('chunk');
        Route::post('/abort', 'abort')->name('abort');
    });
