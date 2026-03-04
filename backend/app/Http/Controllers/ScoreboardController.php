<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Temuan;
use Illuminate\Support\Facades\DB;

class ScoreboardController extends Controller
{

    public function index()
    {
        //ini buat nampilin role besar di scoreboard
        $auditeeRoles = ['Kepala Teknologi Informasi', 'Kepatuhan','Manajemen Remedial', 'Lending', 'Funding', 'Operational'];
        
        //level role yang digabung di role besar utama
        $roleMapping = [
            'KTI' => 'Kepala Teknologi Informasi', //1 org
            'KSO' => 'Operational', //1 org
            'KBO' => 'Operational', //1 org
            'KSA' => 'Operational', //1 org
            'KBL' => 'Lending', //1 org
            'KSL' => 'Lending', //1 org
            'TLU' => 'Lending', //blm ada org
            'KSR' => 'Lending', //2 org
            'KBF' => 'Funding', //1 org
            'KSF' => 'Funding', //2 org
        ];

        $peMapping = [
            44 => 'Kepatuhan', // ID user PE untuk Kepatuhan 1 org
            27 => 'Manajemen Remedial',        // ID user PE untuk  1 org
        ];


        $users = User::select('id', 'name', 'level_role')
            ->get()
            ->map(function($user) use ($roleMapping, $peMapping) {
                if (isset($peMapping[$user->id])) {
                    $user->level_role = $peMapping[$user->id];
                } elseif (isset($roleMapping[$user->level_role])) {
                    $user->level_role = $roleMapping[$user->level_role];
                } else {
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
                // Filter: hanya ambil temuan yang id_auditee = user->id
                $temuans = Temuan::where('id_auditee', $user->id)
                    ->whereHas('responTemuans', function ($query) {
                        $query->where('status_respon', 'Diterima');
                    })
                    ->where('status_temuan', '!=', 'Selesai')
                    ->get();

                $totalTemuans += $temuans->count();

                // sini buat atur skorny dari masing masing role besar
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
                ->orderByRaw("FIELD(status_temuan, 'Terbuka', 'Menunggu Tindaklanjut', 'Menunggu Verifikasi', 'Selesai')")
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

