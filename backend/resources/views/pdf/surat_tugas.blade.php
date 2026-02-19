<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
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
        
        .utt{
            /* font-weight: bold;    */
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
            /* font-size: 11px; */
            
            margin-left: 55px
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
            position: absolute;
            bottom: 0;
            left: 0;
        }

        .ttd2 {
            position: absolute;
            bottom: 0;
            right: 0;
        }
    </style>
</head>
<body>

    <h1>SURAT TUGAS PEMERIKSAAN</h1>
    
    <div class="no-surat">
        Nomor : {{ sprintf('%03d', $suratTugas->id_surat) }}/AI/DIR-MSA/X/{{ date('Y') }}
    </div>
    <div class="field">
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

    <div class="field">
        <p>Setelah melaksanakan pemeriksaan segera dibuat laporan hasil pemeriksaan</p>
        <p>Demikian agar dapat dilaksanakan dengan baik</p>
    </div>
    

    <div class="ttd">
        <p>Yogyakarta, {{ \Carbon\Carbon::now()->format('d F Y') }}</p>
        <p>PT BPR Madani Sejahtera Abadi</p>
        <br>
        <br>
        <br>
        <p style="text-decoration: underline;"><strong>Y Triagung Pujiantoro, SE</strong></p>
        <p>Direktur Utama</p>
    </div>

 
    <div class="page-break"></div>
    
    <h3 style="text-align : center;">PERMINTAAN DATA</h3>
    
    <div class="field">
        <p style="margin: 10px 0; text-align: justify;">
            Berdasarkan Surat Tugas Nomor : {{ sprintf('%03d', $suratTugas->id_surat) }}/AI/DIR-MSA/X/{{ date('Y') }}
            , bersama ini kami memohon untuk disiapkan data sebagai berikut :
        </p>

    </div>
    @if($suratTugas->deskripsi_permintaan)
    <div class="deskripsi-box" >{{ $suratTugas->deskripsi_permintaan }}</div>
    @endif
    
    <p style="margin: 10px 0; text-align: justify;">
       Demikian untuk disiapkan saat pemeriksaan
    </p>
    
    <div class="ttd2">
        <p>Yogyakarta, {{ \Carbon\Carbon::now()->format('d F Y') }}</p>
        <p style="text-align:center;">Ketua Tim Audit Internal</p>
        <br>
        <br>
        <br>
        <p style="text-decoration: underline; text-align:center;"><strong>Lilik Setia Darmawan</strong></p>
    </div>

</body>
</html>


