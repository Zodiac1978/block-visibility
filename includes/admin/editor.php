<?php
/**
 * WRITE A TITLE
 *
 * @package block-visibility
 * @since   1.0.0
 */
 
namespace BlockVisibility\Admin;

use function BlockVisibility\Utils\get_asset_file as get_asset_file;
 
/**
 * Enqueue plugin specific editor scripts and styles
 *
 * @since 1.0.0
 */
function enqueue_editor_scripts() {
    
     
     // Scripts.
 	$asset_file = get_asset_file( 'dist/bv-editor' );

 	wp_enqueue_script(
 		'bv-editor-scripts',
 		BV_PLUGIN_URL . 'dist/bv-editor.js',
 		array_merge( $asset_file['dependencies'], array( 'wp-api' ) ),
 		$asset_file['version'],
 		true
 	);
    
    // Styles.
    wp_enqueue_style( 
        'bv-editor-styles', 
        BV_PLUGIN_URL . 'dist/bv-editor-styles.css', 
        array( 'wp-components' ),
        BV_VERSION
    );
 }
 add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\enqueue_editor_scripts' );
