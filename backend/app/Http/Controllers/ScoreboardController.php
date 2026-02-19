<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Temuan;
use Illuminate\Support\Facades\DB;

class ScoreboardController extends Controller
{

    public function index()
    {

        $auditeeRoles = ['TI', 'Remedial', 'Lending', 'Funding', 'Operational'];
        
        $roleMapping = [
            'TI' => 'TI',
            'KTI' => 'TI',
            'BE' => 'Remedial',  
            'FE' => 'Remedial',  
            'KSR' => 'Remedial',  
            'TLR' => 'Remedial',
            'SA' => 'Lending',
            'AO' => 'Lending',
            'RO' => 'Lending',
            'SO' => 'Lending',
            'TLL' => 'Lending',
            'KSL' => 'Lending',
            'FO' => 'Funding',
            'KSF' => 'Funding',
            'TLF' => 'Funding',
        ];
        

        $users = User::select('id', 'name', 'level_role')
            ->get()
            ->map(function($user) use ($roleMapping) {
                if (isset($roleMapping[$user->level_role])) {
                    $user->level_role = $roleMapping[$user->level_role];
                } else {
                    $user->level_role = 'Operational';
                }
                return $user;
            });

        $scoreboardByRole = [];
        
        foreach ($auditeeRoles as $role) {
            $roleUsers = $users->where('level_role', $role);
            
            $userCount = $roleUsers->count();
            
            $poinAwal = 100;
            $totalPotongan = 0;
            $totalTemuans = 0;
            
            $detailTemuans = [
                'Rendah' => 0,
                'Sedang' => 0,
                'Tinggi' => 0,
            ];

            $auditeeDetails = [];

            foreach ($roleUsers as $user) {
                $temuans = Temuan::where('id_auditee', $user->id)
                    ->whereHas('responTemuans', function ($query) {
                        $query->where('status_respon', 'Diterima');
                    })
                    ->where('status_temuan', '!=', 'Selesai')
                    ->get();

                $totalTemuans += $temuans->count();

                // sini buat atur skorny
                $potongan = $temuans->sum(
                function ($temuan) {
                    return match ($temuan->tingkat_keparahan) {
                        'Rendah' => 1,
                        'Sedang' => 2,
                        'Tinggi' => 3,
                        default => 0,
                    };
                });

                $totalPotongan += $potongan;

                $userDetailTemuan = [
                    'Rendah' => 0,
                    'Sedang' => 0,
                    'Tinggi' => 0,
                ];

                foreach ($temuans as $temuan) {
                    if (isset($detailTemuans[$temuan->tingkat_keparahan])) {
                        $detailTemuans[$temuan->tingkat_keparahan]++;
                    }
                    if (isset($userDetailTemuan[$temuan->tingkat_keparahan])) {
                        $userDetailTemuan[$temuan->tingkat_keparahan]++;
                    }
                }

                $auditeeDetails[] = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'level_role' => $user->level_role,
                    'temuan_count' => $temuans->count(),
                    'detail_temuan' => $userDetailTemuan,
                ];
            }

            $allTemuanList = Temuan::whereIn('id_auditee', $roleUsers->pluck('id'))
                ->whereHas('responTemuans', function ($query) {
                    $query->where('status_respon', 'Diterima');
                })
                ->with('auditee')
                ->orderBy('tingkat_keparahan', 'desc')
                ->get();

            $totalPoin = $poinAwal - $totalPotongan;

            $scoreboardByRole[] = [
                'level_role' => $role,
                'poin' => max($totalPoin, 0),
                'user_count' => $userCount,
                'temuan_count' => $totalTemuans,
                'detail_temuan' => $detailTemuans,
                'auditees' => $auditeeDetails,
                'temuans' => $allTemuanList,
            ];
        }

        usort($scoreboardByRole, fn($a, $b) => $b['poin'] <=> $a['poin']);

            return response()->json([
                'success' => true,
                'data' => $scoreboardByRole,
            ]);
        }
    }
