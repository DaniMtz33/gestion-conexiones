<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// --- AÑADIR ESTE CÓDIGO ---
// Esta es nuestra ruta "catch-all". Atrapa cualquier otra URL que
// el usuario intente visitar y le devuelve la vista principal 'welcome'.
// A partir de ahí, Vue Router se encarga del resto.
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
