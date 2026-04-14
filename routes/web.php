<?php

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// --- RUTA DE PROXY DEFINITIVA ---
Route::any('/api/{any}', function ($any) {
    $apiBaseUrl = 'http://192.168.1.79:7171';
    $request = request();
    $apiUrl = rtrim($apiBaseUrl, '/') . '/' . $any;

    try {
        $response = Http::timeout(60) // <--- Agrega esta línea aquí
                        ->withOptions(['http_errors' => false])
                        // Seteamos el cuerpo y el Content-Type explícitamente
                        ->withBody($request->getContent(), 'application/json')
                        ->acceptJson()
                        ->send($request->method(), $apiUrl, [
                            'query' => $request->query(),
                        ]);

        if ($response->failed()) {
            Log::error('API Proxy Error:', [
                'status' => $response->status(),
                'url' => $apiUrl,
                'response' => $response->body()
            ]);
        }

        // Retornamos la respuesta limpia
        return response($response->body(), $response->status())
                ->header('Content-Type', 'application/json');

    } catch (\Exception $e) {
        Log::error('API Proxy Exception:', ['error' => $e->getMessage()]);
        return response()->json(['message' => $e->getMessage()], 500);
    }
})->where('any', '.*');


// --- RUTA CATCH-ALL PARA VUE ROUTER ---
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '^(?!api\/).*$');