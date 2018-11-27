<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use RichanFongdasen\EloquentBlameable\BlameableTrait;

class Address extends Model
{
    use SoftDeletes, BlameableTrait;

    protected $hidden = ['customer'];

    protected $fillable = ['city', 'country', 'description', 'postcode', 'street', 'supplement', 'customer_id'];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function getDropdownLabelAttribute()
    {
        $baseArray = [];
        if ($this->customer) {
            if ($this->customer->company) {
                $baseArray[] = $this->customer->company->name;
            } elseif ($this->customer->name) {
                $baseArray[] = $this->customer->name;
            }

            if ($this->customer->first_name) {
                $baseArray[] = $this->customer->first_name . ' ' . $this->customer->last_name;
            }
        }

        $baseArray[] = $this->street;
        !$this->supplement ?: array_push($baseArray, $this->supplement);
        $baseArray[] = $this->postcode . ' ' . $this->city;
        !$this->country ?: array_push($baseArray, $this->country);

        return implode(', ', $baseArray);
    }

    public function getRateGroupIdAttribute()
    {
        if ($this->customer) {
            return $this->customer->rate_group_id;
        }
        return null;
    }
}
