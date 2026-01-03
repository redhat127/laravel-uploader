<?php

namespace App\Http\Controllers;

use App\Http\Resources\UploadResource;
use App\Models\Upload;

class HomeController extends Controller
{
    public function index()
    {

        $uploads = Upload::latest()
            ->get();

        return inertia('home', [
            'uploads' => UploadResource::collection($uploads),
        ]);
    }
}
