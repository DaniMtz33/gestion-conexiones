<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// --- RUTA DE PROXY ---
Route::any('/api/{any}', function ($any) {
    $apiBaseUrl = env('API_BASE_URL', 'http://192.168.100.7:7171');
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

        $http = Http::timeout(60)
                    ->withOptions(['http_errors' => false])
                    ->withHeaders($headers)
                    ->acceptJson();

        if (in_array($request->method(), ['POST', 'PUT', 'PATCH'])) {
            $body = $request->getContent();
            if (empty($body)) {
                $encoded = json_encode($request->json()->all(), JSON_UNESCAPED_SLASHES);
                $body = ($encoded !== false) ? $encoded : '{}';
            }
            $http = $http->withBody($body, 'application/json');
        }

        $response = $http->send($request->method(), $apiUrl, [
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

