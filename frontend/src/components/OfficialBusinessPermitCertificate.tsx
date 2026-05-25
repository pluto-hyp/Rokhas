'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export interface BusinessPermitCertificateData {
  dossier_id: number;
  applicant_name: string;
  applicant_cin: string;
  business_name: string;
  business_type: string;
  business_description: string;
  location: string;
  land_reference: string;
  dimensions?: {
    surface_terrain?: number;
  };
  zone: string;
  signed_by: string;
  signature_hash: string;
  signed_at: string;
}

interface OfficialBusinessPermitCertificateProps {
  data: BusinessPermitCertificateData;
  onClose?: () => void;
}

export const OfficialBusinessPermitCertificate: React.FC<OfficialBusinessPermitCertificateProps> = ({
  data,
  onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (certificateRef.current) {
      const printWindow = window.open('', '', 'width=900,height=1200');
      if (printWindow) {
        printWindow.document.write(certificateRef.current.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const monthNames = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    return `${day} ${monthNames[date.getMonth()]} ${year}`;
  };

  const decisionNumber = `LEC-${data.dossier_id}-${new Date(data.signed_at).getFullYear()}`;

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Print-friendly container */}
      <div
        ref={certificateRef}
        className="p-8 bg-white text-black"
        style={{
          fontFamily: 'Georgia, serif',
          lineHeight: '1.7',
          maxWidth: '900px',
          margin: '0 auto',
          color: '#1a1a1a',
        }}
      >
        {/* Official Header Section */}
        <div className="text-center mb-2 pb-3" style={{ borderBottom: '3px solid #8B6F47' }}>
          {/* Arabic and French government headers */}
          <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.15em', color: '#4a4a4a', marginBottom: '8px' }}>
            المملكة المغربية
          </div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.12em', color: '#2c2c2c', marginBottom: '6px' }}>
            ROYAUME DU MAROC
          </div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.1em', color: '#4a4a4a', marginBottom: '8px' }}>
            MINISTÈRE DE L'INTÉRIEUR
          </div>
          
          {/* Royal Coat of Arms */}
          <div className="flex justify-center my-6">
            <img
              src="/Coat_of_arms_of_Morocco.svg"
              alt="Coat of Arms of Morocco"
              style={{
                width: '100px',
                height: '100px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              }}
            />
          </div>

          <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.1em', color: '#4a4a4a' }}>
            DIRECTION GÉNÉRALE DES COLLECTIVITÉS LOCALES
          </div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em', color: '#2c2c2c', marginTop: '8px' }}>
            COMMUNE D'EL KSIBA
          </div>
        </div>

        {/* Main Title Section */}
        <div className="text-center my-8" style={{ marginBottom: '20px' }}>
          <h1
            className="text-4xl font-bold uppercase text-gray-900 mb-2"
            style={{ 
              letterSpacing: '0.2em',
              fontWeight: '900',
              color: '#8B6F47',
              fontSize: '32px',
              marginBottom: '12px'
            }}
          >
            LICENCE D'EXPLOITATION COMMERCIALE
          </h1>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2c2c2c', marginBottom: '8px' }}>
            Décision n° {decisionNumber}
          </div>
          <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', letterSpacing: '0.05em' }}>
            Permis d'Exploitation Professionnelle
          </div>
        </div>

        {/* Decision Body */}
        <div className="mb-6" style={{ textAlign: 'justify', fontSize: '12px', lineHeight: '1.8', color: '#2c2c2c' }}>
          <p style={{ marginBottom: '12px' }}>
            Vu le Code de Commerce et les dispositions réglementaires en vigueur,
          </p>
          <p style={{ marginBottom: '12px' }}>
            Vu le Réglement Municipal relatif aux établissements commerciaux et d'exploitation,
          </p>
          <p style={{ marginBottom: '12px' }}>
            Vu la demande de licence d'exploitation commerciale enregistrée sous la référence administrative :
          </p>
          <p style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', padding: '12px', backgroundColor: '#f8f6f1', border: '1px solid #d4c5b9' }}>
            {data.land_reference}
          </p>

          {/* Business Information Box */}
          <div style={{ backgroundColor: '#faf8f5', padding: '16px', marginBottom: '16px', border: '2px solid #8B6F47' }}>
            <div style={{ fontSize: '12px', marginBottom: '10px' }}>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '150px', display: 'inline-block' }}>Gérant/Exploitant:</span> {data.applicant_name}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '150px', display: 'inline-block' }}>CIN/Passeport:</span> {data.applicant_cin}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '150px', display: 'inline-block' }}>Dénomination Commerciale:</span> {data.business_name}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '150px', display: 'inline-block' }}>Type d'Activité:</span> {data.business_type}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '150px', display: 'inline-block' }}>Description:</span> {data.business_description}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '150px', display: 'inline-block' }}>Localisation:</span> {data.location}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '150px', display: 'inline-block' }}>Zone Commerciale:</span> {data.zone}
              </p>
            </div>
            
            {data.dimensions?.surface_terrain && (
              <div style={{ borderTop: '1px solid #d4c5b9', paddingTop: '10px', fontSize: '11px' }}>
                <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Caractéristiques du Local:</span>
                <ul style={{ marginLeft: '20px', color: '#4a4a4a' }}>
                  <li>Surface utile: {data.dimensions.surface_terrain} m²</li>
                </ul>
              </div>
            )}
          </div>

          <p style={{ marginBottom: '12px' }}>
            Vu le respect des normes d'hygiène, de salubrité et de sécurité applicables,
          </p>
          <p style={{ marginBottom: '12px' }}>
            Vu les frais d'enregistrement municipal et fiscal acquittés,
          </p>
          <p style={{ marginBottom: '16px' }}>
            Après examen du dossier et constatation que l'établissement satisfait à toutes les conditions réglementaires requises,
          </p>

          <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
            AUTORISE:
          </p>
        </div>

        {/* Conditions & Legal Articles */}
        <div className="mb-6">
          <h3 style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #8B6F47', color: '#2c2c2c' }}>
            ARTICLES ET CONDITIONS D'EXPLOITATION
          </h3>

          <ol style={{ fontSize: '11px', lineHeight: '1.8', color: '#2c2c2c' }}>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 1.</span> Est accordée au demandeur la licence d'exploitation commerciale pour l'activité susmentionnée à l'adresse indiquée.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 2.</span> L'exploitation ne peut débuter qu'après l'obtention officielle de la présente licence.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 3.</span> Le titulaire de la licence s'engage à respecter scrupuleusement les normes d'hygiène et de salubrité.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 4.</span> La licence ne peut être cédée ou transférée sans autorisation préalable des autorités compétentes.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 5.</span> Toute modification de l'activité ou de son lieu d'exercice nécessite une autorisation supplémentaire.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 6.</span> L'établissement doit être tenu dans un état constant de propreté et de conformité.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 7.</span> Les horaires d'exploitation doivent respecter la réglementation municipale en vigueur.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 8.</span> L'exploitant est responsable de la sécurité des clients et du personnel.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 9.</span> Le non-respect des conditions peut entraîner la suspension ou révocation de la licence.
            </li>
            <li>
              <span style={{ fontWeight: 'bold' }}>Article 10.</span> La présente licence est valable pour une durée de une (1) année, renouvelable annuellement.
            </li>
          </ol>
        </div>

        {/* Official Signature & Seal Section */}
        <div className="mt-8 pt-6" style={{ borderTop: '3px solid #8B6F47', marginTop: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Left: Signature space for official */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '70px', marginBottom: '8px' }}></div>
              <div style={{ borderTop: '2px solid #2c2c2c', paddingTop: '8px', fontSize: '11px', fontWeight: 'bold', color: '#2c2c2c' }}>
                Le Président du Conseil Communal
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '4px', fontStyle: 'italic' }}>
                Commune d'El Ksiba
              </div>
            </div>

            {/* Right: Digital Signature Info */}
            <div style={{ fontSize: '10px', color: '#2c2c2c' }}>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>Approuvé par:</span> {data.signed_by}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>Date d'Approbation:</span> {formatDate(data.signed_at)}
              </p>
              <p style={{ marginBottom: '8px', color: '#666' }}>
                <span style={{ fontWeight: 'bold' }}>Signature Numérique:</span>
              </p>
              <p
                style={{
                  fontSize: '9px',
                  backgroundColor: '#f0ebe5',
                  padding: '8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  color: '#4a4a4a',
                  wordBreak: 'break-all',
                  border: '1px solid #d4c5b9',
                  lineHeight: '1.4'
                }}
              >
                {data.signature_hash.substring(0, 32)}
                <br />
                {data.signature_hash.substring(32, 64)}
              </p>
            </div>
          </div>
        </div>

        {/* Official Footer with QR Code */}
        <div className="mt-8 pt-4" style={{ borderTop: '2px solid #d4c5b9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '16px', alignItems: 'start' }}>
            {/* QR Code Section */}
            <div style={{ textAlign: 'center', paddingRight: '12px', borderRight: '1px solid #d4c5b9' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Vérification en ligne
              </div>
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://commune-elksiба.ma"
                alt="QR Code - Commune El Ksiba"
                style={{
                  width: '140px',
                  height: '140px',
                  border: '2px solid #d4c5b9',
                  padding: '4px',
                  backgroundColor: 'white'
                }}
              />
              <div style={{ fontSize: '8px', color: '#999', marginTop: '6px', fontStyle: 'italic' }}>
                Lien: commune-elksiба.ma
              </div>
            </div>

            {/* Official Statement Section */}
            <div style={{ textAlign: 'left', fontSize: '10px', color: '#666', paddingLeft: '12px' }}>
              <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                Fait à COMMUNE D'EL KSIBA, le {formatDate(data.signed_at)}
              </p>
              <p style={{ marginBottom: '8px', fontSize: '9px' }}>
                Licence générée numériquement - Certifiée avec authentification numérique SHA-256
              </p>
              <p style={{ fontSize: '9px', color: '#999' }}>
                Rokhas - Système d'Enregistrement des Demandes d'Autorisation pour la Construction au Maroc
              </p>
              <p style={{ fontSize: '8px', color: '#bbb', marginTop: '6px' }}>
                Numéro de Décision: {decisionNumber}
              </p>
              <p style={{ fontSize: '8px', color: '#bbb', marginTop: '4px' }}>
                Scannez le code QR ci-contre pour accéder au site officiel de la commune.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Action Footer */}
      <div className="flex justify-between items-center p-6" style={{ backgroundColor: '#f8f6f1', borderTop: '2px solid #8B6F47' }}>
        <div className="flex gap-3">
          <Button
            onClick={handlePrint}
            variant="default"
            className="flex items-center gap-2"
            style={{ backgroundColor: '#8B6F47', color: 'white' }}
          >
            <Printer size={18} />
            Imprimer la Licence Officielle
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" style={{ borderColor: '#8B6F47', color: '#8B6F47' }}>
              Fermer
            </Button>
          )}
        </div>
        <div style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>
          <p>Décision N°: {decisionNumber}</p>
        </div>
      </div>
    </div>
  );
};
