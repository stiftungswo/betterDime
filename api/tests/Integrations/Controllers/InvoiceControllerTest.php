<?php

namespace App\Http\Controllers;

use App\Models\Invoice\Invoice;
use App\Models\Invoice\InvoiceDiscount;
use App\Models\Invoice\InvoicePosition;
use Laravel\Lumen\Testing\DatabaseTransactions;

class InvoiceControllerTest extends \TestCase
{

    use DatabaseTransactions;

    public function testInvalidDelete()
    {
        // can't delete because object does not exist
        $this->asAdmin()->json('DELETE', 'api/v1/invoices/1789764')->assertResponseStatus(404);
    }

    public function testValidDelete()
    {
        $offerId = factory(Invoice::class)->create()->id;
        $this->asAdmin()->json('DELETE', 'api/v1/invoices/' . $offerId)->assertResponseOk();
        $this->assertEquals('Entity deleted', $this->response->getContent());
    }

    public function testInvalidGet()
    {
        // can't get because object does not exist
        $this->asAdmin()->json('GET', 'api/v1/invoices/1789764')->assertResponseStatus(404);
    }

    public function testValidGet()
    {
        $offer = factory(Invoice::class)->create();
        $this->asAdmin()->json('GET', 'api/v1/invoices/' . $offer->id)->assertResponseOk();

        // answer should also include discounts and positions
        $decodedResponse = $this->responseToArray();
        $this->assertEquals($offer->description, $decodedResponse['description']);
        $this->assertArrayHasKey('discounts', $decodedResponse);
        $this->assertArrayHasKey('positions', $decodedResponse);
    }

    public function testIndex()
    {
        factory(Invoice::class)->create();
        $this->asAdmin()->json('GET', 'api/v1/invoices');
        $this->assertCount(count(Invoice::all()), $this->responseToArray());
    }

    public function testInvalidPost()
    {
        // send invalid test data
        $this->asAdmin()->json('POST', 'api/v1/invoices', [])->assertResponseStatus(422);
    }

    public function testValidPost()
    {
        $template = $this->invoiceTemplate();
        $this->asAdmin()->json('POST', 'api/v1/invoices', $template);
        $this->assertResponseMatchesTemplate($template);
    }

    public function testInvalidParamsPut()
    {
        // can't update because parameters are invalid
        $invoiceId = factory(Invoice::class)->create()->id;
        $this->asAdmin()->json('PUT', 'api/v1/invoices/' . $invoiceId, [])->assertResponseStatus(422);
    }

    public function testInvalidNestedPut()
    {
        // can't update because parameters are invalid
        $invoiceId = factory(Invoice::class)->create()->id;
        $template = $this->invoiceTemplate();
        $template['positions'][2] = [
            'amount' => 30,
            'description' => 'Grassamen',
            'id' => '32378923',
            'order' => 1,
            'price_per_rate' => 500,
            'project_position_id' => factory(\App\Models\Project\ProjectPosition::class)->create()->id,
            'rate_unit_id' => factory(\App\Models\Service\RateUnit::class)->create()->id,
            'vat' => '0.025'
        ];

        $this->asAdmin()->json('PUT', 'api/v1/invoices/' . $invoiceId, $template)->assertResponseStatus(500);
    }

    public function testValidPut()
    {
        // also add one nested relation, delete one and update one
        $invoice = factory(Invoice::class)->create();
        $invoiceDiscountList = factory(InvoiceDiscount::class)->times(2)->make();
        $invoicePositionList = factory(InvoicePosition::class)->times(2)->make();
        $invoice->discounts()->saveMany($invoiceDiscountList);
        $invoice->positions()->saveMany($invoicePositionList);

        $template = $this->invoiceTemplate();
        $template['discounts']['0']['id'] = $invoiceDiscountList[0]->id;
        $template['positions']['0']['id'] = $invoicePositionList[0]->id;

        $this->asAdmin()->json('PUT', 'api/v1/invoices/' . $invoice->id, $template);
        $this->assertResponseMatchesTemplate($template);
    }

    private function invoiceTemplate()
    {
        return [
            'accountant_id' => factory(\App\Models\Employee\Employee::class)->create()->id,
            'address_id' => factory(\App\Models\Customer\Address::class)->create()->id,
            'costgroups' => factory(\App\Models\Invoice\Costgroup::class, 2)->create()->map(function ($c) {
                return $c->number;
            })->sort()->values()->all(),
            'description' => 'Die Meier / Tobler wünscht eine Neuanpflanzung ihrer steriler Wiese vor dem Hauptgebäude. Durch die Neuanpflanzung soll über die nächsten drei Jahre eine ökologisch hochwertige Fläche entstehen, welche als Heimat für eine Vielzahl von Tieren und Pflanzen diesen soll.',
            'discounts' => [
                [
                    'name' => 'Nachbarschaftsrabatt',
                    'percentage' => false,
                    'value' => 50000
                ], [
                    'name' => 'Haustechnikrabatt',
                    'percentage' => true,
                    'value' => 0.1
                ]
            ],
            'end' => '2019-12-31',
            'name' => 'Neuanpflanzung Firmenwiese Meier / Tobler 2019',
            'positions' => [
                [
                    'amount' => 30,
                    'description' => 'Grassamen',
                    'order' => 1,
                    'price_per_rate' => 500,
                    'project_position_id' => factory(\App\Models\Project\ProjectPosition::class)->create()->id,
                    'rate_unit_id' => factory(\App\Models\Service\RateUnit::class)->create()->id,
                    'vat' => '0.025'
                ], [
                    'amount' => 10,
                    'description' => 'Zivis',
                    'order' => 2,
                    'price_per_rate' => 8500,
                    'project_position_id' => factory(\App\Models\Project\ProjectPosition::class)->create()->id,
                    'rate_unit_id' => factory(\App\Models\Service\RateUnit::class)->create()->id,
                    'vat' => '0.077'
                ],
            ],
            'project_id' => factory(\App\Models\Project\Project::class)->create()->id,
            'start' => '2019-01-01'
        ];
    }
}
