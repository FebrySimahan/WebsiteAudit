<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function getAuditees()
    {
        try {
            
            $auditees = User::whereNotIn('level_role', ['Direksi', 'Kom'])
                ->get(['id', 'name', 'email', 'level_role'])
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => $auditees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data auditee: ' . $e->getMessage(),
            ], 500);
        }
    }
}
