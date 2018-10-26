<?php

namespace App\Models\Offer;

use App\Models\Customer\Address;
use App\Models\Employee\Employee;
use App\Models\Service\RateGroup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Offer extends Model
{
    use SoftDeletes;

    protected $fillable = ['accountant_id', 'address_id', 'customer_id', 'customer_type', 'description', 'fixed_price', 'name', 'short_description', 'rate_group_id', 'status'];

    public function accountant()
    {
        return $this->belongsTo(Employee::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function customer()
    {
        return $this->morphTo();
    }

    public function discounts()
    {
        return $this->hasMany(OfferDiscount::class);
    }

    public function positions()
    {
        return $this->hasMany(OfferPosition::class);
    }

    public function rate_group()
    {
        return $this->belongsTo(RateGroup::class);
    }
}