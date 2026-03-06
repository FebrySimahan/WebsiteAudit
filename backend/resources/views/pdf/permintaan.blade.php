<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 10mm;
            size: 330mm 210mm;
        }

        body { 
            font-family: Arial, sans-serif; 
            margin: 10px; 
            padding: 0;
            font-size: 10px; 
        }

        h1 { 
            color: #333; 
            font-size: 13px; 
            margin: 3px 0; 
        }
        h4 {
            color: #000;
            font-size: 30px;
            font-weight: bold;
            margin: 5px 0;
            text-align: center;
        }

        h5 {
            color: #000;
            font-size: 15px;
            font-weight: light;
            /* margin: 5px 0; */
            text-align: center;
            white-space: nowrap;
        }
        h3 { 
            color: #555; 
            font-size: 12px; 
            margin: 8px 0 6px 0; 
            font-weight: bold;
            text-align: center;
        }

        .field { 
            margin-bottom: 5px; 
        }

        .label { 
            font-weight: bold; 
            color: #555; 
            width: 80px; 
            display: inline-block; 
        }

        .value { 
            color: #333; 
        }

        hr { 
            margin: 5px 0; 
            border: none; 
            border-top: 1px solid #ddd; 
        }

        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 8px; 
            font-size: 10px;
            line-height: 1.4;
        }

        table.temuan-table {
            table-layout: fixed;
            page-break-inside: auto;
        }

        table.temuan-table thead {
            display: table-header-group;
        }

        table.temuan-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }

        table:first-of-type {
            font-size: 11px;
        }

        table:first-of-type td {
            padding: 8px 6px;
            font-weight: bold;
        }

        table.temuan-table td, table.temuan-table th {
            width: auto;
        }

        table.temuan-table th:nth-child(1),
        table.temuan-table td:nth-child(1) {
            width: 4%;
        }

        table.temuan-table th:nth-child(2),
        table.temuan-table td:nth-child(2) {
            width: 16%;
        }

        table.temuan-table th:nth-child(3),
        table.temuan-table td:nth-child(3) {
            width: 16%;
        }

        table.temuan-table th:nth-child(4),
        table.temuan-table td:nth-child(4) {
            width: 12%;
        }

        table.temuan-table th:nth-child(5),
        table.temuan-table td:nth-child(5) {
            width: 12%;
        }

        table.temuan-table th:nth-child(6),
        table.temuan-table td:nth-child(6) {
            width: 13%;
        }

        table.temuan-table th:nth-child(7),
        table.temuan-table td:nth-child(7) {
            width: 13%;
        }

        table.temuan-table th:nth-child(8),
        table.temuan-table td:nth-child(8) {
            width: 14%;
        }

        th, td { 
            border: 1px solid #000; 
            padding: 6px 5px; 
            text-align: left;
            vertical-align: top;
        }
        
        td {
            word-wrap: break-word;
            overflow-wrap: break-word;
            word-break: break-all;
            hyphens: auto;
            max-height: 100px;
        }
        
        th { 
            background-color: #e8e8e8; 
            font-weight: bold;
            white-space: normal;
            font-size: 9px;
        }
        
        .signature-section {
            page-break-inside: avoid;
            margin-top: 30px;
        }
        
        .signature-row-group {
            page-break-inside: avoid;
        }

        .text-akhir {
            color: gray;
            text-decoration: underline;
        }


    </style>
</head>
<body>

<table>
    <tr>
        <td><img src="{{ public_path('/msa.png') }}" alt="" style="max-width: 100px;"></td>
        <td><h4>IKHTISAR TEMUAN DAN REKOMENDASI HASIL AUDIT</h4></td>
        <td><h5>Nomor : {{ sprintf('%03d', $permintaan->id_surat ?? ($permintaan->surat->id_surat ?? 0)) }}/AI/DIR-MSA/{{ ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][now()->month - 1] }}/{{ date('Y') }}</h5></td>
    
      
    </tr>
    <tr>
        <td>Unit Kerja</td>
        <td colspan="2">{{ $permintaan->divisi ?? '-' }} / {{ $permintaan->level_role ?? '-' }}</td>
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
        
        <table class="temuan-table">
            <thead>
                <tr>
                    <th style="text-align: center;">No</th>
                    <th style="text-align: center;">Kondisi Sebenarnya</th>
                    <th style="text-align: center;">Keadaan Seharusnya</th>
                    <th style="text-align: center;">Dampak</th>
                    <th style="text-align: center;">Penyebab</th>
                    <th style="text-align: center;">Rekomendasi Tindak Lanjut</th>
                    <th style="text-align: center;">Tanggapan Auditee </th>
                    <th style="text-align: center;">Komitmen Auditee </th>
                </tr>
            </thead>
            <tbody>
           @foreach($permintaan->temuans as $index => $temuan)
                @php
                    $respon = $temuan?->responTemuans->first(); 
                    $tindaklanjut = $respon?->tindakLanjuts->first();
                    $verifikasi = $tindaklanjut?->verifikasis->first();
                @endphp
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ $temuan->kondisi_sebenarnya ??  '-' }}</td>
                    <td>{{ $temuan->keadaan_seharusnya ?? '-' }}</td>
                    <td>{{ $temuan->dampak ?? '-' }}</td>
                    <td>{{ $temuan->penyebab ?? '-' }}</td>
                    <td>{{ $temuan->rekomendasi ?? '-' }}</td>
                    <td>{{ $tindaklanjut->deskripsi_tindak_lanjut ?? '-' }}</td>
                    <td>{{ $tindaklanjut->deskripsi_komitmen ?? '-' }}</td>
                </tr>
            @endforeach
            </tbody>
        </table>
    @endif

    <div style="margin-top: 40px; margin-left: auto; width: 50%; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse;" class="signature-section">
            @php
                $auditees = isset($auditeeList) && is_array($auditeeList) ? $auditeeList : [];
                $auditors = [
                    'Lilik Setia Darmawan',
                    'Muthia Riza Fauziah'
                ];
                $maxRows = max(count($auditees), count($auditors)); // Always show all auditors
            @endphp

            @for($i = 0; $i < $maxRows; $i++)
                <tr style="page-break-inside: avoid;">
                    <td style="height: 20px; border: 1px solid #ddd; padding: 5px;">
                        @if(isset($auditees[$i]))
                            Auditee : {{ $auditees[$i] }}
                        @endif
                    </td>
                    <td style="height: 20px; border: 1px solid #ddd; padding: 5px;">
                        @if($i == 0)
                            Auditor : {{ $auditors[0] }}
                        @elseif($i == 1)
                            Auditor : {{ $auditors[1] }}
                        @endif
                    </td>
                </tr>
                
                <tr style="page-break-inside: avoid;">
                    <td style="height: 50px; border: 1px solid #ddd; padding: 5px;">
                        @if(isset($auditees[$i]))
                            Tanggal:
                        @endif
                    </td>
                    <td style="height: 50px; border: 1px solid #ddd; padding: 5px;">
                        @if($i == 0 || $i == 1)
                            Tanggal:
                        @endif
                    </td>
                </tr>
            @endfor
        </table>
    </div>

<script type="text/php">
    if (isset($pdf)) {
        $pdf->page_script(function($pageNumber, $pageCount, $canvas, $fontMetrics) {
            $font = $fontMetrics->getFont('Helvetica');
            $size = 8;
            $y = $canvas->get_height() - 30;

            $canvas->line(28, $y - 5, $canvas->get_width() - 28, $y - 5, array(0.8, 0.8, 0.8), 0.5);

            $text = 'BPR Madani Sejahtera Abadi - Ikhtisar Temuan dan Rekomendasi Hasil Audit';
            $canvas->text(28, $y, $text, $font, $size, array(0.5, 0.5, 0.5));

            $pageText = $pageNumber;
            $textWidth = $fontMetrics->getTextWidth($pageText, $font, $size);
            $canvas->text($canvas->get_width() - $textWidth - 28, $y, $pageText, $font, $size, array(0, 0, 0));
        });
    }
</script>
</body>
</html>
