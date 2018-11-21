<?php

use Illuminate\Database\Eloquent\Factory;

/** @var Factory $factory */
$factory->define(\App\Models\Invoice\InvoicePosition::class, function () {
    $faker = Faker\Factory::create('de_CH');

    return [
        'amount' => $faker->numberBetween(1, 40),
        'description' => $faker->words(5, true),
        'order' => $faker->numberBetween(1, 50),
        'price_per_rate' => $faker->numberBetween(3000, 18000),
        'vat' => $faker->randomElement([0.025, 0.077]),
    ];
});