<?php

namespace Tests\Integrations\Controllers;

use App\Models\Project\Project;
use App\Models\Project\ProjectPosition;
use Laravel\Lumen\Testing\DatabaseTransactions;

class ProjectControllerTest extends \TestCase
{
    use DatabaseTransactions;

    public function testInvalidDelete()
    {
        // can't delete because object does not exist
        $this->asAdmin()->json('DELETE', 'api/v1/projects/1789764')->assertResponseStatus(404);
    }

    public function testValidDelete()
    {
        $projectId = factory(Project::class)->create()->id;
        $this->asAdmin()->json('DELETE', 'api/v1/projects/' . $projectId)->assertResponseOk();
        $this->assertEquals('Entity deleted', $this->response->getContent());
    }

    public function testGetIndex()
    {
        factory(Project::class)->create();
        $this->asAdmin()->json('GET', 'api/v1/projects');
        $decodedResponse = $this->responseToArray();
        $this->assertEquals(count(Project::all()), count($decodedResponse));
    }

    public function testInvalidGet()
    {
        // can't get because object does not exist
        $this->asAdmin()->json('GET', 'api/v1/projects/1789764')->assertResponseStatus(404);
    }

    public function testValidGet()
    {
        $project = factory(Project::class)->create();
        $this->asAdmin()->json('GET', 'api/v1/projects/' . $project->id)->assertResponseOk();
        $decodedResponse = $this->responseToArray();

        $this->assertEquals($project->name, $decodedResponse['name']);
        $this->assertArrayHasKey('positions', $decodedResponse);
    }

    public function testInvalidPost()
    {
        // send invalid test data
        $this->asAdmin()->json('POST', 'api/v1/projects', [])->assertResponseStatus(422);
    }

    public function testValidPost()
    {
        $template = $this->projectTemplate();
        $this->asAdmin()->json('POST', 'api/v1/projects', $template);
        $this->assertResponseMatchesTemplate($template);
    }

    public function testInvalidObjectPut()
    {
        // can't update because object does not exist
        $this->asAdmin()->json('PUT', 'api/v1/projects/1789764', $this->projectTemplate())->assertResponseStatus(404);
    }

    public function testInvalidParamsPut()
    {
        // can't update because parameters are invalid
        $projectId = factory(Project::class)->create()->id;
        $this->asAdmin()->json('PUT', 'api/v1/projects/' . $projectId, [])->assertResponseStatus(422);
    }

    public function testInvalidNestedPut()
    {
        // can't update because parameters are invalid
        $projectId = factory(Project::class)->create()->id;
        $template = $this->projectTemplate();
        $template['positions'][2] = [
            'description' => 'Einsatzleiter',
            'id' => 5458937458372,
            'price_per_rate' => 9200,
            'rate_unit_id' => factory(\App\Models\Service\RateUnit::class)->create()->id,
            'service_id' => factory(\App\Models\Service\Service::class)->create()->id,
            'vat' => '0.077'
        ];

        $this->asAdmin()->json('PUT', 'api/v1/projects/' . $projectId, $template)->assertResponseStatus(500);
    }

    public function testValidPut()
    {
        // also add one nested relation, delete one and update one
        $project = factory(Project::class)->create();
        $projectPositionList = factory(ProjectPosition::class)->times(2)->make();
        $project->positions()->saveMany($projectPositionList);

        $template = $this->projectTemplate();
        $template['positions']['0']['id'] = $projectPositionList[0]->id;

        $this->asAdmin()->json('PUT', 'api/v1/projects/' . $project->id, $template);
        $this->assertResponseMatchesTemplate($template);
    }

    private function projectTemplate()
    {
        return [
            'accountant_id' => factory(\App\Models\Employee\Employee::class)->create()->id,
            'address_id' => factory(\App\Models\Customer\Address::class)->create()->id,
            'archived' => false,
            'budget_price' => 5678420,
            'budget_time' => 3528,
            'category_id' => factory(\App\Models\Project\ProjectCategory::class)->create()->id,
            'chargeable' => true,
            'deadline' => '2019-12-31',
            'description' => 'Die Meier / Tobler wünscht eine Neuanpflanzung ihrer steriler Wiese vor dem Hauptgebäude. Durch die Neuanpflanzung soll über die nächsten drei Jahre eine ökologisch hochwertige Fläche entstehen, welche als Heimat für eine Vielzahl von Tieren und Pflanzen diesen soll.',
            'fixed_price' => 5678420,
            'name' => 'Neuanpflanzung Meier / Tobler 2018 / 2019',
            'offer_id' => factory(\App\Models\Offer\Offer::class)->create()->id,
            'positions' => [
                [
                    'description' => 'Einsatzleiter',
                    'price_per_rate' => 9200,
                    'rate_unit_id' => factory(\App\Models\Service\RateUnit::class)->create()->id,
                    'service_id' => factory(\App\Models\Service\Service::class)->create()->id,
                    'vat' => '0.077'
                ], [
                    'description' => 'Direktbegrünung',
                    'price_per_rate' => 250,
                    'rate_unit_id' => factory(\App\Models\Service\RateUnit::class)->create()->id,
                    'service_id' => factory(\App\Models\Service\Service::class)->create()->id,
                    'vat' => '0.025'
                ],
            ],
            'rate_group_id' => factory(\App\Models\Service\RateGroup::class)->create()->id,
            'started_at' => '2018-10-29',
            'stopped_at' => '2019-10-29',
        ];
    }
}