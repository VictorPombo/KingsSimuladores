/**
 * supabase/seeds/update_seven_images.ts
 *
 * Atualiza as imagens dos produtos da Seven no banco.
 * Faz match por nome do produto (busca parcial, case-insensitive).
 *
 * Como rodar:
 *   NEXT_PUBLIC_SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> bun supabase/seeds/update_seven_images.ts
 *   ou: npx tsx supabase/seeds/update_seven_images.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Dados extraídos do CSV real da Tray — tray_id real + imagem principal
const IMAGES_FROM_TRAY: Array<{ tray_id: string; nome: string; imagem: string }> = [
  { tray_id: '37',  nome: 'Base simagic Alpha EVO Pro 18nm - Base Direct Drive',          imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/base_simagic_alpha_evo_pro_18nm_base_direct_drive_37_1_5870523884ddc8bb2d4ad500645d73a4.jpg' },
  { tray_id: '39',  nome: 'Simagic Alpha EVO Sport 9 Nm Base Direct Drive',               imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/simagic_alpha_evo_sport_9_nm_base_direct_drive_39_1_3da07f2f6999bdbfe4d8f0466ff1cf87.jpg' },
  { tray_id: '41',  nome: 'Aro Simagic P-325C (Couro)',                                   imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/aro_simagic_p_325c_couro_41_1_54d9eb72e7574c6c02800f0e0605226e.jpg' },
  { tray_id: '45',  nome: 'Aro Simagic P-330R (Couro)',                                   imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/aro_simagic_p_330r_couro_45_1_d6c6d7e27c0ae0a9dc6ff759cfe0660e.jpg' },
  { tray_id: '47',  nome: 'Câmbio Sequencial Simagic Q1S',                                imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/cambio_sequencial_simagic_q1s_47_1_59feaf7b0e86d9fc93b649dada175bd5.jpg' },
  { tray_id: '53',  nome: 'Câmbio Simagic DS-8X',                                         imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/cambio_simagic_ds_8x_dual_mode_padrao_h_e_sequencial_53_1_533711c415f2b03daec3b4c21e986cb5.jpg' },
  { tray_id: '55',  nome: 'Embreagem Simagic C-P1000',                                    imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/embreagem_simagic_c_p1000_serie_p1000_55_1_bad066e1a9d71ae4a9bc7d3873b979ab.jpg' },
  { tray_id: '57',  nome: 'Embreagem Simagic C-P500',                                     imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/embreagem_simagic_c_p500_57_1_d179211a325ca4020d686f0ea4da110d.jpg' },
  { tray_id: '59',  nome: 'Reator de pedal Tátil linear Simagic P-HPR GT',                imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/reator_de_pedal_tatil_linear_simagic_p_hpr_gt_59_1_de4f47cc2ab3e01e1814ca4f52fb3ab4.jpg' },
  { tray_id: '61',  nome: 'Freio de Mão Simagic TB-1',                                    imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/freio_de_mao_simagic_tb_1_61_1_c21d4a2315701bcb322e32ceb4da93b3.jpg' },
  { tray_id: '63',  nome: 'Kit de Borrachas e Molas Simagic P-ORP',                       imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/kit_de_borrachas_e_molas_simagic_p_orp_63_1_a3955a106fef69f4805303afd5bc019d.jpg' },
  { tray_id: '65',  nome: 'Kit de Borrachas e Molas Simagic P-ORP(H) HIDRAULICO',         imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/kit_de_borrachas_e_molas_simagic_p_orp_h_hidraulico_65_1_b88ef624589d50dba6fa1250427cc4e1.jpg' },
  { tray_id: '67',  nome: 'Kit de Inversão Simagic P1000',                                imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/kit_de_inversao_simagic_p1000_67_1_69d23e346503493223c984644d669e97.jpg' },
  { tray_id: '69',  nome: 'Paddle Shifter Kit Simagic UP+',                               imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/paddle_shifter_kit_simagic_up_neo_x_gt_neo_69_1_87c61fc43c49f22c029b72a1e950298c.jpg' },
  { tray_id: '71',  nome: 'Pedal Simagic P1000-F',                                        imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/pedal_simagic_p1000_f_71_1_6a4bbabd65aa4d58f47c6c78ca5ac3f2.jpg' },
  { tray_id: '73',  nome: 'Pedal Simagic P1000-FRS Hidráulico',                           imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/pedal_simagic_p1000_frs_hidraulico_73_1_ccfcaddd4f16c0e4f6f8a02135d94df9.jpg' },
  { tray_id: '75',  nome: 'Pedal Simagic (DUPLO) P2000-S200RF',                           imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/pedal_simagic_duplo_p2000_s200rf_75_1_c3496340aaa442aaf2091bfae39dd60d.jpg' },
  { tray_id: '77',  nome: 'Pedal Simagic P500 Dual Pedal',                                imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/pedal_simagic_p500_dual_pedal_77_1_c7164933014fba658a921926cbf055c4.jpg' },
  { tray_id: '79',  nome: 'Placa de Acelerador Longa Simagic P-L100',                     imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/placa_de_acelerador_longa_simagic_p_l100_79_1_f8dd53345292be4ed838e9f3a5c3f6f0.jpg' },
  { tray_id: '81',  nome: 'Quick Release Simagic QR50',                                   imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/quick_release_simagic_qr50_50_mm_81_1_3e0526e1b2df75404bfe2b1c1c8f5c38.jpg' },
  { tray_id: '83',  nome: 'Quick Release Simagic QR70',                                   imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/quick_release_simagic_qr70_70mm_83_1_3e0526e1b2df75404bfe2b1c1c8f5c38.jpg' },
  { tray_id: '85',  nome: 'Simagic MagLink Adaptador',                                    imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/simagic_maglink_adaptador_bases_nao_simagic_85_1_ddb6d0a5fc2a7ece42af8119bcb6859a.jpg' },
  { tray_id: '87',  nome: 'Simagic NEO X Hub',                                            imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/simagic_neo_x_hub_87_1_6e1b55f9a1649fa5b3bb4b4e79ceaa69.jpg' },
  { tray_id: '89',  nome: 'Suporte de Montagem Frontal Simagic Alpha Evo',                imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/suporte_de_montagem_frontal_simagic_alpha_evo_89_1_0f8026f1c51d998b39a2bb30ac74aed7.jpg' },
  { tray_id: '91',  nome: 'Volante Simagic FX Pro',                                       imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/volante_simagic_fx_pro_91_1_bc59ef4c63dfff7fc6cf1eeff62b7b03.jpg' },
  { tray_id: '93',  nome: 'Volante Simagic FX-C',                                         imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/volante_simagic_fx_c_1_20260119153345_81d5cb0ac7fe.jpg' },
  { tray_id: '95',  nome: 'Volante Simagic GT NEO',                                       imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/volante_simagic_gt_neo_95_1_9e79c10e599f8325049cec2dd44663e9.jpg' },
  { tray_id: '97',  nome: 'Volante Simagic NEO X 330T',                                   imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/volante_simagic_neo_x_330t_gt_97_1_a5ec6f1cea5de21870cfedfd26f76b65.jpg' },
  { tray_id: '99',  nome: 'Suporte de Montagem Lateral para Alpha EVO Simagic',           imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/suporte_de_montagem_lateral_para_alpha_evo_simagic_99_1_5503ad2fd2673a43efe755c263843581.jpg' },
  { tray_id: '101', nome: 'Volante Simagic NEO X 310G',                                   imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/volante_simagic_neo_x_310g_101_1_19f695c32a3b27b5e4f0652b41bac486.jpg' },
  { tray_id: '103', nome: 'Base simagic Alpha EVO 12nm',                                  imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/base_simagic_alpha_evo_12nm_base_direct_drive_103_1_3056e355bb65b4cc96c4586f8f0f358b.jpg' },
  { tray_id: '107', nome: 'Aro Simagic P-330R(K) (Couro)',                                imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/aro_simagic_p_330r_k_couro_107_1_817ddadd395d65747ab1b74c14005873.jpg' },
  { tray_id: '109', nome: 'Pedais Simagic P1000 (3 pedais)',                              imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/pedais_simagic_p1000_3_pedais_com_celula_de_carga_109_1_9f8df9acaa4121e6f6d864101a84754b.jpg' },
  { tray_id: '115', nome: 'Fonte de Alimentação para Pedais',                             imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/fonte_de_alimentacao_para_pedais_p_hpr_p_srb_e_s_rh_115_1_c7d7f5c89622ebecd68eeec5a3261db4.jpg' },
  { tray_id: '121', nome: 'Suporte para monitor Thermaltake GR300 até 50 Pol (Preto)',    imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/suporte_para_monitor_thermaltake_gr300_ate_50_pol_preto_121_1_0857620529269129f8254315a6505f1f.jpg' },
  { tray_id: '123', nome: 'Suporte para monitor Thermaltake GR300 até 50 Pol (Branco)',   imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/suporte_para_monitor_thermaltake_gr300_ate_50_pol_branco_123_1_1892b0b1551f5c24f8969fdf23ac5cf1.jpg' },
  { tray_id: '125', nome: 'Tapete de chão para simulador Thermaltake',                    imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/tapete_de_chao_para_simulador_thermaltake_125_1_6245e7300229b9262b08127f0a17f4dd.jpg' },
  { tray_id: '151', nome: 'Cockpit Thermaltake GR300 Racing - Seven Racing',              imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/cockpit_thermaltake_gr300_racing_seven_racing_151_1_d9240f5fbefd34e367a6e59e75096902.jpg' },
  { tray_id: '153', nome: 'Embreagem para Pedal (P2000) - C-P2000',                      imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/embreagem_para_pedal_p2000_c_p2000_153_1_5af2283e944cc7895df6efee80a41dbd.jpg' },
  { tray_id: '155', nome: 'SISTEMA HIDRAULICO P-HYS (P1000)',                             imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/sistema_hidraulico_p_hys_p1000_155_1_c492c8422a23b9c7123495923c15cb71.jpg' },
  { tray_id: '157', nome: 'SUPORTE DE MESA - SIMAGIC - T-LOC',                            imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/suporte_de_mesa_simagic_t_loc_157_1_21aedf79f69d5ee45391ec6b5db4c30f.jpg' },
  { tray_id: '159', nome: 'Fonte de Alimentação Pedais (P-HPR, P-SRB E S-RH) - UNIVERSAL', imagem: 'https://images.tcdn.com.br/img/img_prod/1433338/fonte_de_alimentacao_pedais_p_hpr_p_srb_e_s_rh_universal_159_1_fd16930561074e76590f4c7e6ce790fc.png' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function updateImages() {
  console.log('🖼️  Atualizando imagens dos produtos Seven...\n')

  // Buscar brand_id da Seven
  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('name', 'seven')
    .single()

  if (!brand) throw new Error("Brand 'seven' não encontrada")

  // Buscar todos os produtos da Seven (sem imagem ou com array vazio)
  const { data: produtos } = await supabase
    .from('products')
    .select('id, title, images')
    .eq('brand_id', brand.id)

  if (!produtos?.length) {
    console.log('Nenhum produto encontrado para a Seven.')
    return
  }

  console.log(`Encontrados ${produtos.length} produtos no banco.\n`)

  let ok = 0, skip = 0, notFound = 0

  for (const trayItem of IMAGES_FROM_TRAY) {
    // Match por substring do nome (case-insensitive)
    const keyword = trayItem.nome
      .toLowerCase()
      .split(' ')
      .slice(0, 4)          // usar as 4 primeiras palavras como chave de busca
      .join(' ')

    const match = produtos.find(p =>
      p.title.toLowerCase().includes(keyword) ||
      keyword.includes(p.title.toLowerCase().split(' ').slice(0, 4).join(' '))
    )

    if (!match) {
      console.log(`  ⚠️  Não encontrado: "${trayItem.nome.slice(0, 50)}"`)
      notFound++
      continue
    }

    // Já tem imagem real? Pular
    if (match.images?.length > 0 && !match.images[0].includes('placehold')) {
      console.log(`  ⏭️  Já tem imagem: "${match.title.slice(0, 50)}"`)
      skip++
      continue
    }

    const { error } = await supabase
      .from('products')
      .update({ images: [trayItem.imagem] })
      .eq('id', match.id)

    if (error) {
      console.log(`  ❌ Erro: "${match.title.slice(0, 50)}" → ${error.message}`)
    } else {
      console.log(`  ✔  "${match.title.slice(0, 50)}"`)
      ok++
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ Atualizados : ${ok}`)
  console.log(`⏭️  Já tinham   : ${skip}`)
  if (notFound > 0) console.log(`⚠️  Não achados : ${notFound}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  if (notFound > 0) {
    console.log('💡 Para os não encontrados, acesse /admin/produtos e adicione a imagem manualmente.')
  }
}

updateImages().catch(err => {
  console.error('💥 Falhou:', err)
  process.exit(1)
})
