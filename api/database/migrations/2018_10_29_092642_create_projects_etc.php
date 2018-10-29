<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProjectsEtc extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('accountant_id')->nullable();
            $table->foreign('accountant_id')->references('id')->on('employees')->onDelete('set null');
            $table->unsignedInteger('address_id')->nullable();
            $table->foreign('address_id')->references('id')->on('addresses')->onDelete('set null');
            $table->boolean('archived')->default(false);
            $table->integer('budget_price')->nullable();
            $table->integer('budget_time')->nullable();
            $table->unsignedInteger('category_id')->nullable();
            $table->foreign('category_id')->references('id')->on('project_categories')->onDelete('set null');
            $table->boolean('chargeable')->default(true);
            $table->date('deadline')->nullable();
            $table->text('description');
            $table->integer('fixed_price')->nullable();
            $table->string('name');
            $table->unsignedInteger('offer_id')->nullable();
            $table->foreign('offer_id')->references('id')->on('offers')->onDelete('set null');
            $table->unsignedInteger('rate_group_id')->nullable();
            $table->foreign('rate_group_id')->references('id')->on('rate_groups')->onDelete('set null');
            $table->date('started_at')->nullable();
            $table->date('stopped_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('project_positions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('description')->nullable();
            $table->integer('price_per_rate');
            $table->unsignedInteger('project_id')->nullable();
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->unsignedInteger('rate_unit_id')->nullable();
            $table->foreign('rate_unit_id')->references('id')->on('rate_units')->onDelete('set null');
            $table->unsignedInteger('service_id')->nullable();
            $table->foreign('service_id')->references('id')->on('services')->onDelete('set null');
            $table->decimal('vat', 4, 3);
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('project_efforts', function (Blueprint $table) {
            $table->increments('id');
            $table->date('date');
            $table->unsignedInteger('employee_id')->nullable();
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
            $table->unsignedInteger('project_position_id')->nullable();
            $table->foreign('project_position_id')->references('id')->on('project_positions')->onDelete('cascade');
            $table->decimal('value', 10, 3);
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('project_comments', function (Blueprint $table) {
            $table->increments('id');
            $table->text('comment');
            $table->date('date');
            $table->unsignedInteger('project_id')->nullable();
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('project_comments');
        Schema::dropIfExists('project_efforts');
        Schema::dropIfExists('project_positions');
        Schema::dropIfExists('projects');
    }
}