'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export interface PermitCertificateData {
  dossier_id: number;
  applicant_name: string;
  applicant_cin: string;
  project_title: string;
  project_description: string;
  location: string;
  land_reference: string;
  dimensions: {
    hauteur?: number;
    recul?: number;
    emprise?: number;
    surface_terrain?: number;
  };
  zone: string;
  signed_by: string;
  signature_hash: string;
  signed_at: string;
}

interface OfficialPermitCertificateProps {
  data: PermitCertificateData;
  onClose?: () => void;
}

export const OfficialPermitCertificate: React.FC<OfficialPermitCertificateProps> = ({
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

  const decisionNumber = `PC-${data.dossier_id}-${new Date(data.signed_at).getFullYear()}`;

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
            PERMIS DE CONSTRUIRE
          </h1>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2c2c2c', marginBottom: '8px' }}>
            Décision n° {decisionNumber}
          </div>
          <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', letterSpacing: '0.05em' }}>
            Arrêté Municipal
          </div>
        </div>

        {/* Decision Body */}
        <div className="mb-6" style={{ textAlign: 'justify', fontSize: '12px', lineHeight: '1.8', color: '#2c2c2c' }}>
          <p style={{ marginBottom: '12px' }}>
            Vu le Réglement Général de Construction (RGC) en vigueur,
          </p>
          <p style={{ marginBottom: '12px' }}>
            Vu le Code de l'Urbanisme et de la Construction,
          </p>
          <p style={{ marginBottom: '12px' }}>
            Vu le dossier de demande de permis de construire enregistré sous la référence administrative :
          </p>
          <p style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', padding: '12px', backgroundColor: '#f8f6f1', border: '1px solid #d4c5b9' }}>
            {data.land_reference}
          </p>

          {/* Applicant & Project Information Box */}
          <div style={{ backgroundColor: '#faf8f5', padding: '16px', marginBottom: '16px', border: '2px solid #8B6F47' }}>
            <div style={{ fontSize: '12px', marginBottom: '10px' }}>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '120px', display: 'inline-block' }}>Demandeur:</span> {data.applicant_name}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '120px', display: 'inline-block' }}>CIN:</span> {data.applicant_cin}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '120px', display: 'inline-block' }}>Titre du Projet:</span> {data.project_title}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '120px', display: 'inline-block' }}>Description:</span> {data.project_description}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '120px', display: 'inline-block' }}>Localisation:</span> {data.location}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '120px', display: 'inline-block' }}>Zone d'Urbanisme:</span> {data.zone}
              </p>
            </div>
            
            {(data.dimensions.hauteur || data.dimensions.surface_terrain) && (
              <div style={{ borderTop: '1px solid #d4c5b9', paddingTop: '10px', fontSize: '11px' }}>
                <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Caractéristiques Techniques:</span>
                <ul style={{ marginLeft: '20px', color: '#4a4a4a' }}>
                  {data.dimensions.hauteur && <li>Hauteur: {data.dimensions.hauteur} m</li>}
                  {data.dimensions.recul && <li>Recul: {data.dimensions.recul} m</li>}
                  {data.dimensions.emprise && <li>Emprise: {data.dimensions.emprise} %</li>}
                  {data.dimensions.surface_terrain && <li>Surface du terrain: {data.dimensions.surface_terrain} m²</li>}
                </ul>
              </div>
            )}
          </div>

          <p style={{ marginBottom: '12px' }}>
            Vu le rapport technique de conformité avec le Réglement Général de Construction,
          </p>
          <p style={{ marginBottom: '12px' }}>
            Vu les frais d'enregistrement municipal acquittés par le demandeur,
          </p>
          <p style={{ marginBottom: '16px' }}>
            Après étude approfondie du dossier et vérification de la conformité totale du projet avec les dispositions légales et réglementaires en vigueur,
          </p>

          <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
            ARRÊTE:
          </p>
        </div>

        {/* Conditions & Legal Articles */}
        <div className="mb-6">
          <h3 style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #8B6F47', color: '#2c2c2c' }}>
            ARTICLES ET CONDITIONS OBLIGATOIRES
          </h3>

          <ol style={{ fontSize: '11px', lineHeight: '1.8', color: '#2c2c2c' }}>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 1.</span> Est accordé un permis de construire au demandeur susmentionné pour la réalisation du projet conforme aux conditions énumérées ci-après.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 2.</span> Le bénéficiaire du permis doit commencer les travaux dans un délai de deux (2) années à partir de la date officielle d'octroi du présent permis.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 3.</span> Les travaux doivent être exécutés en conformité stricte et totale avec les plans et tous documents approuvés par les autorités compétentes.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 4.</span> Le bénéficiaire doit respecter scrupuleusement les conditions de sécurité et de salubrité publiques selon la réglementation en vigueur.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 5.</span> Tout changement ou modification du projet initial doit faire l'objet d'une demande d'autorisation préalable auprès des autorités compétentes.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 6.</span> Les travaux doivent être exécutés dans le respect total de l'environnement et des normes acoustiques et de pollution applicables.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 7.</span> L'inspection du chantier sera effectuée par les services compétents à différentes étapes d'avancement du projet.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 8.</span> À la fin des travaux, une demande de certificat de conformité doit être présentée pour validation officielle par les autorités.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 9.</span> Le non-respect de toute condition stipulée peut entraîner la révocation immédiate du permis de construire.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 10.</span> La durée de validité du permis est de cinq (5) années à partir de sa date officielle d'octroi.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 11.</span> En cas de non-démarrage des travaux après le délai prescrit, le permis devient automatiquement nul et non avenu.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 12.</span> Tout recours contentieux doit être formé devant les autorités compétentes selon les voies légales et réglementaires prévues.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 13.</span> Le bénéficiaire s'engage formellement à préserver le site et ses alentours lors de l'exécution des travaux.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 14.</span> L'assurance responsabilité civile est obligatoire et doit être maintenue durant toute la durée des travaux.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 15.</span> Une clôture de sécurité conforme doit être mise en place autour du périmètre des travaux.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Article 16.</span> Les conditions d'urbanisme, de sécurité et d'hygiène doivent être respectées scrupuleusement à tout moment.
            </li>
            <li>
              <span style={{ fontWeight: 'bold' }}>Article 17.</span> Le présent arrêté municipal entre en vigueur à partir de sa date officielle d'approbation et de signature.
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
                <span style={{ fontWeight: 'bold' }}>Signature Numérique Certifiée:</span>
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

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-400 text-center text-xs text-gray-600">
          <p>Document généré numériquement - Valide avec authentification numérique</p>
          <p className="mt-1">Rokhas - Système d'Enregistrement des Demandes d'Autorisation pour la Construction</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center p-6 bg-gray-50 border-t">
        <div className="flex gap-3">
          <Button
            onClick={handlePrint}
            variant="default"
            className="flex items-center gap-2"
          >
            <Printer size={18} />
            Imprimer
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline">
              Fermer
            </Button>
          )}
        </div>
        <div className="text-xs text-gray-600">
          <p>Décision: {decisionNumber}</p>
        </div>
      </div>
    </div>
  );
};
