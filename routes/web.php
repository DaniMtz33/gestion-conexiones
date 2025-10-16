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
    $apiBaseUrl = 'http://192.168.1.77:7171';
    $request = request();
    $apiUrl = rtrim($apiBaseUrl, '/') . '/' . $any;

    try {
        // Creamos una petición "limpia" en lugar de reenviar todas las cabeceras.
        // Esto evita enviar cabeceras como 'Host', 'X-XSRF-TOKEN', etc., que pueden confundir a la API.
        $response = Http::withOptions(['http_errors' => false])
                        ->acceptJson() // Establece explícitamente 'Accept: application/json'
                        ->send($request->method(), $apiUrl, [
                            'query' => $request->query(),
                            'body' => $request->getContent(),
                        ]);

        if ($response->failed()) {
            Log::error('API Proxy Error:', [
                'status' => $response->status(),
                'url' => $apiUrl,
                'response' => $response->body()
            ]);
        }

        return response($response->body(), $response->status(), $response->headers());

    } catch (ConnectionException $e) {
        Log::error('API Proxy Connection Failed:', ['error' => $e->getMessage()]);
        return response()->json(['message' => 'Error de conexión del proxy a la API.'], 502);
    }
})->where('any', '.*');


// --- RUTA CATCH-ALL PARA VUE ROUTER ---
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '^(?!api\/).*$');