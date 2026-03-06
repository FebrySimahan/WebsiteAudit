<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 20mm;
            size: A4;
        }

        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            font-size: 12px;
            line-height: 1.6;
        }
        
        h1 {
            text-align: center;
            color: #333;
            font-size: 18px;
            margin-bottom: 5px;
        }
        
        .subtitle {
            text-align: center;
            color: black;
            font-size: 11px;
            margin-bottom: 20px;
        }
        
        .utt {
            margin-left: 15px;
        }

        .no-surat {
            text-align: center;
            margin-bottom: 20px;
            font-size: 11px;
        }
        
        .no-surat strong {
            font-weight: bold;
        }
        
        h3 {
            color: #333;
            font-size: 13px;
            margin-top: 15px;
            margin-bottom: 10px;
            padding-bottom: 5px;
        }
        
        .field {
            margin-bottom: 8px;
            display: flex;
            page-break-inside: avoid;
        }
        
        .label {
            font-weight: bold;
            width: 140px;
            color: black;
        }
        
        .separator {
            width: 20px;
            text-align: center;
            font-weight: bold;
        }
        
        .value {
            color: #333;
            flex: 1;
            word-wrap: break-word;
        }
        
        .deskripsi-box {
            margin: 8px 0;
            border-radius: 3px;
            white-space: pre-wrap;
            word-wrap: break-word;
            margin-bottom: 15px;
            margin-left: 55px;
            page-break-inside: avoid;
        }
    
        .footer {
            text-align: center;
            font-size: 9px;
            color: #999;
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .ttd {
            page-break-inside: avoid;
            position: relative;
            margin-top: 40px;
        }

        .ttd2 {
            page-break-inside: avoid;
            position: relative;
            margin-top: 40px;
        }
    </style>
</head>
<body>

    <h1>SURAT TUGAS PEMERIKSAAN</h1>
    
    @php
        \Carbon\Carbon::setLocale('id');
    @endphp
    <div class="no-surat">
Nomor : {{ sprintf('%03d', $suratTugas->id_surat ?? 0) }}/AI/DIR-MSA/{{ ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][now()->month - 1] }}/{{ date('Y') }}    </div>

    <div class="field" style="display: block;">
        <p style="text-align: left;">Direksi PT BPR Madani Sejahtera Abadi, menugaskan Tim Audit :</p>
        <p style="margin-left: 15px;">1.   Ketua Tim   <span>: Lilik Setia Darmawan</span></p>
        <p style="margin-left: 15px;">2.   Anggota     <span>: Muthia Riza Fauziah</span></p>
        <p>Untuk melakukan pemeriksaan terhadap :</p>
    </div>

    <div class="field">
        <div class="utt">Unit Kerja : {{ $suratTugas->unit_kerja }}</div>
    </div>

    <div class="field">
        <div class="utt">Tujuan Audit   : </div>
        <div class="deskripsi-box">{{ $suratTugas->tujuan_audit }}</div>
    </div>

    <div class="field">
        @php
            \Carbon\Carbon::setLocale('id');
            $mulai = \Carbon\Carbon::parse($suratTugas->tanggal_mulai);
            $selesai = \Carbon\Carbon::parse($suratTugas->tanggal_selesai);
        @endphp
        @if($mulai->format('F') != $selesai->format('F'))
        <div class="utt">Tanggal Pemeriksaan : <strong>{{ $mulai->translatedFormat('d F') }} - {{ $selesai->translatedFormat('d F Y') }}</strong></div>
        @else
        <div class="utt">Tanggal Pemeriksaan : <strong>{{ $mulai->translatedFormat('d') }} - {{ $selesai->translatedFormat('d F Y') }}</strong></div>
        @endif
    </div>

    <div class="field" style="display: block;">
        <p>Setelah melaksanakan pemeriksaan segera dibuat laporan hasil pemeriksaan</p>
        <p>Demikian agar dapat dilaksanakan dengan baik</p>
    </div>

    <div class="ttd">
        <p>Yogyakarta, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
        <p>PT BPR Madani Sejahtera Abadi</p>
        <br>
        <br>
        <br>
        <p style="text-decoration: underline; margin-bottom: 5px;"><strong>Y Triagung Pujiantoro, SE</strong></p>
        <p style="margin-top: 5px;">Direktur Utama</p>
    </div>

    <div class="page-break"></div>
    
    <h3 style="text-align: center;">Ikthisar Temuan</h3>
    
    <div class="field" style="display: block;">
        <p style="margin: 10px 0; text-align: justify;">
            Berdasarkan Surat Tugas Nomor : {{ sprintf('%03d', $suratTugas->id_surat ?? 0) }}/AI/DIR-MSA/{{ ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][now()->month - 1] }}/{{ date('Y') }}
            , bersama ini kami memohon untuk disiapkan data sebagai berikut :
        </p>
    </div>

    @if($suratTugas->deskripsi_permintaan)
    <div class="deskripsi-box">{{ $suratTugas->deskripsi_permintaan }}</div>
    @endif
    
    <p style="margin: 10px 0; text-align: justify;">
        Demikian untuk disiapkan saat pemeriksaan
    </p>

    <div class="ttd2">
        <p>Yogyakarta, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
        <p>Ketua Tim Audit Internal</p>
        <br>
        <br>
        <br>
        <p style="text-decoration: underline; "><strong>Lilik Setia Darmawan</strong></p>
    </div>

</body>
</html>