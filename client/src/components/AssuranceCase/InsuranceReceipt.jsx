import { useState, useRef } from 'react';
import { Printer } from 'lucide-react';

export default function InsuranceReceipt({ 
  insuranceData = {
    policyNumber: '',
    startDate: '',
    endDate: '',
    client: { fullName: '' },
    primeTTC: 0,
    vehicle: { make: '', model: '', registrationNumber: '' }
  }, 
  companyInfo = {
    name: 'Assurance Janti',
    address: '38, BLOC (B), AMICALE DES FONCTIONNAIRES, TIZNIT - MAROC',
    phone: '07 62 64 37 47',
    fax: '05 28 86 17 17',
    email: 'assurancejanti@gmail.com',
    website: 'rmaassurance.com'
  }
}) {
  const [receiptNumber, setReceiptNumber] = useState('000002');
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('fr-FR');
  });
  const printRef = useRef();
 
  console.log("asd",insuranceData)
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Reçu d'Assurance</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: white;
            }
            .container {
              max-width: 900px;
              margin: 0 auto;
            }
            .receipts-container {
              display: flex;
              gap: 30px;
              justify-content: space-between;
            }
            .receipt {
              width: 48%;
              border: 1px solid #000;
              padding: 24px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              background-color: white;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 16px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 16px;
            }
            .logo-container {
              display: flex;
              align-items: center;
            }
            .aj-logo {
              margin-right: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .aj-text {
              font-size: 24px;
              font-weight: bold;
              color: #1e3a8a;
            }
            .aj-subtext, .rma-subtext {
              font-size: 10px;
            }
            .rma-logo {
              margin-left: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .rma-text {
              font-weight: bold;
            }
            .receipt-number {
              color: #991b1b;
              font-size: 24px;
              font-weight: bold;
              margin: 16px 0;
              text-align: center;
            }
            .content {
              margin-top: 24px;
            }
            .field-row {
              display: flex;
              align-items: center;
              margin-bottom: 24px;
            }
            .field-label {
              width: 33.333%;
            }
            .field-value {
              width: 66.666%;
              border-bottom: 1px dotted #9ca3af;
              padding-bottom: 4px;
            }
            .divider {
              border-bottom: 1px dotted #9ca3af;
              margin: 16px 0;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 64px;
            }
            .signature-box {
              width: 50%;
              text-align: center;
            }
            .signature-label {
              font-style: italic;
              margin-bottom: 40px;
            }
            .footer {
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #000;
            }
            .footer-content {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
            }
            .company-details {
              display: flex;
              align-items: center;
            }
            .company-logo-small {
              font-size: 18px;
              font-weight: bold;
              color: #1e3a8a;
              margin-right: 8px;
            }
            .company-address {
              font-weight: 600;
            }
            .company-contact {
              text-align: right;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="receipts-container">
              <!-- Company Copy -->
              <div class="receipt">
                <div class="header">
                  <div class="logo-container">
                    <div class="aj-logo">
                      <div class="aj-text">AJ</div>
                      <div class="aj-subtext">Assurance Janti</div>
                      <div class="aj-subtext">Agent Général Toutes Branches</div>
                    </div>
                    <div class="rma-logo">
                      <div class="rma-text">RMA</div>
                      <div class="rma-subtext">ROYALE MAROCAINE</div>
                      <div class="rma-subtext">D'ASSURANCE</div>
                      <div class="rma-subtext" style="font-style: italic;">EN TOUTE SÉRÉNITÉ</div>
                    </div>
                  </div>
                </div>

                <div class="receipt-number">${receiptNumber}</div>

                <div class="content">
                  <div class="field-row">
                    <span class="field-label">Tiznit, le :</span>
                    <span class="field-value">${currentDate}</span>
                  </div>
                  
                  <div class="field-row">
                    <span class="field-label">Nom et Prénom :</span>
                    <span class="field-value">${insuranceData.client.fullName}</span>
                  </div>
                  
                  <div class="field-row">
                    <span class="field-label">N° Police :</span>
                    <span class="field-value">${insuranceData.policyNumber}</span>
                  </div>
                  
                  <div class="divider"></div>
                  
                  <div class="field-row">
                    <span class="field-label">Somme :</span>
                    <span class="field-value">
                      ${new Intl.NumberFormat('fr-FR').format(insuranceData.primeTTC)} DH
                    </span>
                  </div>
                </div>

                <div class="signatures">
                  <div class="signature-box">
                    <p class="signature-label">Visa Assureur :</p>
                  </div>
                  <div class="signature-box">
                    <p class="signature-label">Visa Client :</p>
                  </div>
                </div>
              </div>

              <!-- Client Copy -->
              <div class="receipt">
                <div class="header">
                  <div class="logo-container">
                    <div class="aj-logo">
                      <div class="aj-text">AJ</div>
                      <div class="aj-subtext">Assurance Janti</div>
                      <div class="aj-subtext">Agent Général Toutes Branches</div>
                    </div>
                    <div class="rma-logo">
                      <div class="rma-text">RMA</div>
                      <div class="rma-subtext">ROYALE MAROCAINE</div>
                      <div class="rma-subtext">D'ASSURANCE</div>
                      <div class="rma-subtext" style="font-style: italic;">EN TOUTE SÉRÉNITÉ</div>
                    </div>
                  </div>
                </div>

                <div class="receipt-number">${receiptNumber}</div>

                <div class="content">
                  <div class="field-row">
                    <span class="field-label">Tiznit, le :</span>
                    <span class="field-value">${currentDate}</span>
                  </div>
                  
                  <div class="field-row">
                    <span class="field-label">Nom et Prénom :</span>
                    <span class="field-value">${insuranceData.client.fullName}</span>
                  </div>
                  
                  <div class="field-row">
                    <span class="field-label">N° Police :</span>
                    <span class="field-value">${insuranceData.policyNumber}</span>
                  </div>
                  
                  <div class="divider"></div>
                  
                  <div class="field-row">
                    <span class="field-label">Montant net à payer :</span>
                    <span class="field-value">
                      ${new Intl.NumberFormat('fr-FR').format(insuranceData.primeTTC)} DH
                    </span>
                  </div>
                </div>

                <div class="signatures">
                  <div class="signature-box">
                    <p class="signature-label">Visa Assureur :</p>
                  </div>
                  <div class="signature-box">
                    <p class="signature-label">Visa Client :</p>
                  </div>
                </div>

                <div class="footer">
                  <div class="footer-content">
                    <div class="company-details">
                      <div class="company-logo-small">AJ</div>
                      <div>
                        <p class="company-address">${companyInfo.address}</p>
                        <p>Tél: ${companyInfo.phone}</p>
                        <p>Fix: ${companyInfo.fax}</p>
                      </div>
                    </div>
                    <div class="company-contact">
                      <p>${companyInfo.email}</p>
                      <p>${companyInfo.website}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="print-button" style="text-align: center; margin-top: 24px;">
              <button onclick="window.print()" style="background-color: #2563eb; color: white; padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; display: inline-flex; align-items: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Imprimer
              </button>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Give the browser a moment to render before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  // The React component UI remains the same
  return (
    <div className="p-4 bg-gray-50" ref={printRef}>
      <div className="flex gap-8">
        {/* Company Copy */}
        <div className="w-1/2 border border-gray-300 p-6 bg-white shadow-sm">
          <div className="flex justify-between items-center border-b pb-4">
            <div className="flex items-center">
              <div className="mr-2">
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-blue-900">AJ</div>
                  <div className="text-xs">Assurance Janti</div>
                  <div className="text-xs">Agent Général Toutes Branches</div>
                </div>
              </div>
              <div className="ml-2">
                <div className="flex flex-col items-center">
                  <div className="font-bold">RMA</div>
                  <div className="text-xs">ROYALE MAROCAINE</div>
                  <div className="text-xs">D'ASSURANCE</div>
                  <div className="text-xs italic">EN TOUTE SÉRÉNITÉ</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center my-4">
            <div className="text-3xl font-bold text-red-800">{receiptNumber}</div>
          </div>

          <div className="mt-6 space-y-6">
            <div className="flex items-center">
              <span className="w-1/3">Tiznit, le :</span>
              <span className="w-2/3 border-b border-dotted border-gray-400 pb-1">{currentDate}</span>
            </div>
            
            <div className="flex items-center">
              <span className="w-1/3">Nom et Prénom :</span>
              <span className="w-2/3 border-b border-dotted border-gray-400 pb-1">{insuranceData.client.fullName}</span>
            </div>
            
            <div className="flex items-center">
              <span className="w-1/3">N° Police :</span>
              <span className="w-2/3 border-b border-dotted border-gray-400 pb-1">{insuranceData.policyNumber}</span>
            </div>
            
            <div className="border-b border-dotted border-gray-400 my-4"></div>
            
            <div className="flex items-center">
              <span className="w-1/3">Somme :</span>
              <span className="w-2/3 border-b border-dotted border-gray-400 pb-1">
                {new Intl.NumberFormat('fr-FR').format(insuranceData.primeTTC)} DH
              </span>
            </div>
          </div>

          <div className="flex justify-between mt-16">
            <div className="w-1/2 text-center">
              <p className="italic mb-10">Visa Assureur :</p>
            </div>
            <div className="w-1/2 text-center">
              <p className="italic mb-10">Visa Client :</p>
            </div>
          </div>
        </div>

        {/* Client Copy */}
        <div className="w-1/2 border border-gray-300 p-6 bg-white shadow-sm">
          <div className="flex justify-between items-center border-b pb-4">
            <div className="flex items-center">
              <div className="mr-2">
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-blue-900">AJ</div>
                  <div className="text-xs">Assurance Janti</div>
                  <div className="text-xs">Agent Général Toutes Branches</div>
                </div>
              </div>
              <div className="ml-2">
                <div className="flex flex-col items-center">
                  <div className="font-bold">RMA</div>
                  <div className="text-xs">ROYALE MAROCAINE</div>
                  <div className="text-xs">D'ASSURANCE</div>
                  <div className="text-xs italic">EN TOUTE SÉRÉNITÉ</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center my-4">
            <div className="text-3xl font-bold text-red-800">{receiptNumber}</div>
          </div>

          <div className="mt-6 space-y-6">
            <div className="flex items-center">
              <span className="w-1/3">Tiznit, le :</span>
              <span className="w-2/3 border-b border-dotted border-gray-400 pb-1">{currentDate}</span>
            </div>
            
            <div className="flex items-center">
              <span className="w-1/3">Nom et Prénom :</span>
              <span className="w-2/3 border-b border-dotted border-gray-400 pb-1">{insuranceData.client.fullName}</span>
            </div>
            
            <div className="flex items-center">
              <span className="w-1/3">N° Police :</span>
              <span className="w-2/3 border-b border-dotted border-gray-400 pb-1">{insuranceData.policyNumber}</span>
            </div>
            
            <div className="border-b border-dotted border-gray-400 my-4"></div>
            
            <div className="flex items-center">
              <span className="w-1/3">Montant net à payer :</span>
              <span className="w-2/3 border-b border-dotted border-gray-400 pb-1">
                {new Intl.NumberFormat('fr-FR').format(insuranceData.primeTTC)} DH
              </span>
            </div>
          </div>

          <div className="flex justify-between mt-16">
            <div className="w-1/2 text-center">
              <p className="italic mb-10">Visa Assureur :</p>
            </div>
            <div className="w-1/2 text-center">
              <p className="italic mb-10">Visa Client :</p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-800">
            <div className="flex justify-between text-xs">
              <div className="flex items-center">
                <div className="mr-2 text-xl font-bold text-blue-900">AJ</div>
                <div>
                  <p className="font-semibold">{companyInfo.address}</p>
                  <p>Tél: {companyInfo.phone}</p>
                  <p>Fix: {companyInfo.fax}</p>
                </div>
              </div>
              <div className="text-right">
                <p>{companyInfo.email}</p>
                <p>{companyInfo.website}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handlePrint}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Printer className="h-5 w-5 mr-2" />
          Imprimer le Reçu
        </button>
      </div>
    </div>
  );
}