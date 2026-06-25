<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// --- RUTA DE PROXY ---
Route::any('/api/{any}', function ($any) {
    $apiBaseUrl = 'http://192.168.100.6:7171';
    $request    = request();
    $apiUrl     = rtrim($apiBaseUrl, '/') . '/' . $any;

    try {
        $headers = [];

        // Para PUT/PATCH en recursos REST (no subroutines), obtener u2version automaticamente
        if (in_array($request->method(), ['PUT', 'PATCH']) && !str_contains($apiUrl, '/subroutine/')) {
            $getResp = Http::timeout(30)->acceptJson()->get($apiUrl);
            if ($getResp->successful()) {
                $u2version = $getResp->json('u2version');
                if ($u2version) {
                    $headers['If-Match'] = $u2version;
                }
            }
        }

        $response = Http::timeout(60)
                        ->withOptions(['http_errors' => false])
                        ->withBody($request->getContent(), 'application/json')
                        ->withHeaders($headers)
                        ->acceptJson()
                        ->send($request->method(), $apiUrl, [
                            'query' => $request->query(),
                        ]);

        if ($response->failed()) {
            Log::error('API Proxy Error:', [
                'status'   => $response->status(),
                'url'      => $apiUrl,
                'response' => $response->body(),
            ]);
        }

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
})->where('any', '.*');
