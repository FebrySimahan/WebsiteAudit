<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; font-size: 12px; 
        }

        h1 { 
            color: #333; 
            font-size: 18px; 
            margin-bottom: 15px; 
        }

        h3 { 
            color: #555; 
            font-size: 14px; 
            margin-top: 20px; 
            margin-bottom: 10px; 
        }

        .field { 
            margin-bottom: 10px; 
        }

        .label { 
            font-weight: bold; 
            color: #555; 
            width: 120px; 
            display: inline-block; 
        }

        .value { 
            color: #333; 
        }

        hr { 
            margin: 15px 0; 
            border: none; 
            border-top: 1px solid #ddd; 
        }

        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
        }

        th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
        }
        
        th { 
            background-color: #f0f0f0; 
            font-weight: bold; 
        }
    </style>
</head>
<body>

<table>
    <tr>
        <td><img src="{{ public_path('/msa.png') }}" alt="" style="max-width: 100px;"></td>
        <td><h4>IKHTISAR TEMUAN DAN REKOMENDASI HASIL AUDIT</h4></td>
        <td> Nomor : {{ sprintf('%03d', $permintaan->surat->id_surat ?? 0) }}/AI/DIR-MSA/X/{{ date('Y') }}</td>
      
    </tr>
    <tr>
        <td>Unit Kerja</td>
        <td colspan="2">{{ $permintaan->divisi ?? '-' }}</td>
    </tr>
    <tr>
        <td>Fokus Audit</td>
        <td colspan="2">{{ $permintaan->judul_permintaan ?? '-' }}</td>
    </tr>
    <tr>
        <td>Periode Audit</td>
        <td colspan="2">  
            @if($permintaan->jadwal_audits?->count())
                @php
                    \Carbon\Carbon::setLocale('id');
                    $jadwalPertama = $permintaan->jadwal_audits->first();
                    $tahun = \Carbon\Carbon::parse($jadwalPertama->tanggal_audit)->year;
                    $bulan = $permintaan->jadwal_audits
                        ->map(fn($jadwal) => \Carbon\Carbon::parse($jadwal->tanggal_audit)->translatedFormat('F'))
                        ->unique()
                        ->values();
                @endphp
                {{ $bulan->implode('- ') }} {{ $tahun }}
            @else
                {{-- Jika tidak ada jadwal audit --}}
            @endif
        </td>
    </tr>
    <tr>
        <td>Nama Pemeriksa</td>
        <td colspan="2">1. Lilik Setia Darmawan
            <br>2. Muthia Riza Fauziah
        </td>
    </tr>

</table>

    @if(isset($permintaan->temuans) && $permintaan->temuans?->count())
        
        <h3>Temuan Audit</h3>
        <table>
            <tr>
                <th>No</th>
                <th>Kondisi Sebenarnya</th>
                <th>Keadaan Seharusnya</th>
                <th>Dampak</th>
                <th>Penyebab</th>
                <th>Rekomendasi Tindak Lanjut</th>
                <th>Tanggapan Auditee (tindak lanjut)</th>
                <th>Komitmen Auditee (catatan verifikasi)</th>
            </tr>
           @foreach($permintaan->temuans as $index => $temuan)
                @php
                    $respon = $temuan?->responTemuans->first(); 
                    $tindaklanjut = $respon?->tindakLanjuts->first();
                    $verifikasi = $tindaklanjut?->verifikasis->first();
                @endphp
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $temuan->kondisi_sebenarnya ?? '-' }}</td>
                    <td>{{ $temuan->keadaan_seharusnya ?? '-' }}</td>
                    <td>{{ $temuan->dampak ?? '-' }}</td>
                    <td>{{ $temuan->penyebab ?? '-' }}</td>
                    <td>{{ $temuan->rekomendasi ?? '-' }}</td>
                    <td>{{ $tindaklanjut->deskripsi_tindak_lanjut ?? '-' }}</td>
                    <td>{{ $verifikasi->catatan ?? '-' }}</td>
                </tr>
            @endforeach
        </table>
    @endif
</body>
</html>
