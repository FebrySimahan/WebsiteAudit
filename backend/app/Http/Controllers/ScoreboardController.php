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
        $auditeeRoles = ['Kepala Teknologi Informasi', 'Kepatuhan','Manajemen Risiko', 'Lending', 'Funding', 'Operational'];
        
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
            'TLM' => 'Lending', //2 org
            'KBF' => 'Funding', //1 org
            'KSF' => 'Funding', //2 org
        ];

        $peMapping = [
            44 => 'Kepatuhan', // ID user PE untuk Kepatuhan 1 org
            27 => 'Manajemen Resiko',        // ID user PE untuk  1 org
        ];
        
        // Reverse mapping untuk query by level_role asli di table - caranya yang benar
        $reverseRoleMapping = [];
        foreach ($roleMapping as $original => $mapped) {
            if (!isset($reverseRoleMapping[$mapped])) {
                $reverseRoleMapping[$mapped] = [];
            }
            $reverseRoleMapping[$mapped][] = $original;
        }

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

            // Cari original level roles yang map ke role ini
            $originalLevelRoles = $reverseRoleMapping[$role] ?? [];
            
            // Query temuans: by level_role dari roleMapping, ATAU by id_auditee dari PE users
            $allTemuanList = Temuan::where(function($query) use ($originalLevelRoles, $roleUsers) {
                    if (!empty($originalLevelRoles)) {
                        $query->whereIn('level_role', $originalLevelRoles);
                    }
                    // Tambah by id_auditee dari PE users (untuk Kepatuhan & Manajemen Resiko)
                    $query->orWhereIn('id_auditee', $roleUsers->pluck('id'));
                })
                ->with('auditee')
                ->orderByRaw("FIELD(status_temuan, 'Terbuka', 'Menunggu Tindaklanjut', 'Menunggu Verifikasi', 'Selesai')")
                ->get();
            
            // Hitung scoring dan detail dari semua temuans per level role
            $totalTemuans = $allTemuanList->count();
            
            foreach ($allTemuanList as $temuan) {
                // Detail temuan (semua status)
                if (isset($detailTemuans[$temuan->tingkat_keparahan])) {
                    $detailTemuans[$temuan->tingkat_keparahan]++;
                }
                
                // Hitung potongan poin hanya dari temuan yang belum selesai DAN bukan Terbuka
                if ($temuan->status_temuan !== 'Selesai' && $temuan->status_temuan !== 'Terbuka') {
                    $potongan = match ($temuan->tingkat_keparahan) {
                        'Rendah' => 1,
                        'Sedang' => 2,
                        'Tinggi' => 3,
                        default => 0,
                    };
                    $totalPotongan += $potongan;
                }
            }

            $totalPoin = $poinAwal - $totalPotongan;
            
            // Populate auditee details dengan data user dan temuan mereka
            $auditeeDetails = [];
            foreach ($roleUsers as $user) {
                $userTemuans = $allTemuanList->filter(function($temuan) use ($user) {
                    return $temuan->id_auditee == $user->id || $temuan->level_role == $user->level_role;
                });
                
                $userDetailTemuan = [
                    'Rendah' => 0,
                    'Sedang' => 0,
                    'Tinggi' => 0,
                ];
                
                foreach ($userTemuans as $temuan) {
                    if (isset($userDetailTemuan[$temuan->tingkat_keparahan])) {
                        $userDetailTemuan[$temuan->tingkat_keparahan]++;
                    }
                }
                
                $auditeeDetails[] = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'level_role' => $user->level_role,
                    'temuan_count' => $userTemuans->count(),
                    'detail_temuan' => $userDetailTemuan,
                ];
            }

            $scoreboardByRole[] = [
                'level_role' => $role,
                'poin' => max($totalPoin, 0),
                'user_count' => $userCount,
                'temuan_count' => $totalTemuans,
                'detail_temuan' => $detailTemuans,
                'auditees' => $auditeeDetails,
                'temuans' => $allTemuanList->map(function($temuan) {
                    return [
                        'id_temuan' => $temuan->id,
                        'judul_temuan' => $temuan->judul_temuan,
                        'tingkat_keparahan' => $temuan->tingkat_keparahan,
                        'status_temuan' => $temuan->status_temuan,
                        'auditee' => $temuan->auditee ? [
                            'id' => $temuan->auditee->id,
                            'name' => $temuan->auditee->name,
                        ] : null,
                    ];
                })->values(),
            ];
        }

        usort($scoreboardByRole, fn($a, $b) => $b['poin'] <=> $a['poin']);

            return response()->json([
                'success' => true,
                'data' => $scoreboardByRole,
            ]);
    }
}

